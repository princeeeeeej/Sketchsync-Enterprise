package com.sketchsync.collaboration_service.snapshot;

import com.sketchsync.collaboration_service.client.CoreServiceClient;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class SnapshotManager {

    private static final long SAVE_DELAY_SECONDS = 1;

    private final CoreServiceClient coreServiceClient;

    private final Map<Long, SnapshotState> snapshots = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    public SnapshotManager(CoreServiceClient coreServiceClient) {
        this.coreServiceClient = coreServiceClient;
    }

    public void updateSnapshot(Long roomId, JsonNode data, String accessToken) {
        SnapshotState state =
                snapshots.compute(
                        roomId,
                        (id, existing) -> {

                            if (existing == null) {
                                return new SnapshotState(
                                        data,
                                        accessToken
                                );
                            }

                            existing.update(
                                    data,
                                    accessToken
                            );

                            return existing;
                        }
                );

        scheduleSave(roomId, state);
    }

    private void scheduleSave(Long roomId, SnapshotState state) {
        synchronized (state) {
            if (snapshots.get(roomId) != state
                    || state.saveScheduled
                    || state.saving) {
                return;
            }

            state.saveScheduled = true;
        }

        scheduler.schedule(
                () -> save(roomId),
                SAVE_DELAY_SECONDS,
                TimeUnit.SECONDS
        );
    }

    private void save(Long roomId) {
        SnapshotState state = snapshots.get(roomId);

        if (state == null) {
            return;
        }

        JsonNode data;
        String accessToken;
        long version;

        synchronized (state) {
            if (snapshots.get(roomId) != state) {
                return;
            }

            if (state.saving) {
                state.saveScheduled = false;
                return;
            }

            data = state.data;
            accessToken = state.accessToken;
            version = state.version;

            state.saving = true;
            state.saveScheduled = false;
        }

        try {

            System.out.println("Saving canvas snapshot | room=" + roomId + " | version=" + version);

            coreServiceClient.saveSnapshot(
                    roomId,
                    accessToken,
                    data
            );

            synchronized (state) {

                /*
                 * A newer snapshot arrived while the DB
                 * request was running.
                 */
                if (state.version > version) {

                    state.saving = false;

                    scheduleSaveAfterSave(
                            roomId,
                            state
                    );

                } else {

                    state.saving = false;

                    /*
                     * Nothing newer exists, so this state
                     * has successfully been persisted.
                     */
                    snapshots.remove(
                            roomId,
                            state
                    );
                }
            }

            System.out.println("Canvas snapshot saved | room=" + roomId + " | version=" + version);

        } catch (Exception e) {

            synchronized (state) {
                state.saving = false;
                state.saveScheduled = false;
            }

            System.err.println("Failed to save canvas snapshot | room=" + roomId + " | error=" + e.getMessage());

            /*
             * Retry later instead of permanently losing
             * the latest in-memory snapshot.
             */
            scheduleSave(
                    roomId,
                    state
            );
        }
    }

    private void scheduleSaveAfterSave(Long roomId, SnapshotState state) {
        synchronized (state) {
            if (snapshots.get(roomId) != state
                    || state.saveScheduled
                    || state.saving) {
                return;
            }

            state.saveScheduled = true;
        }

        scheduler.schedule(
                () -> save(roomId),
                SAVE_DELAY_SECONDS,
                TimeUnit.SECONDS
        );
    }

    public void saveImmediately(Long roomId) {
        SnapshotState state = snapshots.get(roomId);

        if (state == null) {
            return;
        }

        JsonNode data;
        String accessToken;
        long version;

        synchronized (state) {
            if (snapshots.get(roomId) != state) {
                return;
            }

            // An existing save will handle the latest version.
            if (state.saving) {
                return;
            }

            data = state.data;
            accessToken = state.accessToken;
            version = state.version;

            state.saving = true;
            state.saveScheduled = false;
        }

        try {
            coreServiceClient.saveSnapshot(
                    roomId,
                    accessToken,
                    data
            );

            synchronized (state) {
                state.saving = false;

                if (state.version == version) {
                    // Delete only after the latest version is persisted.
                    snapshots.remove(roomId, state);
                } else {
                    // New data arrived while the request was running.
                    scheduleSaveAfterSave(roomId, state);
                }
            }

            System.out.println(
                    "Final canvas snapshot saved | room=" + roomId
            );

        } catch (Exception e) {
            synchronized (state) {
                state.saving = false;
                state.saveScheduled = false;
            }

            System.err.println(
                    "Failed to save final canvas snapshot | room="
                            + roomId
                            + " | error="
                            + e.getMessage()
            );

            // Keep the state and retry.
            scheduleSave(roomId, state);
        }
    }

    private static class SnapshotState {

        private JsonNode data;

        private String accessToken;

        private long version = 0;

        private boolean saveScheduled;

        private boolean saving;

        SnapshotState(JsonNode data, String accessToken) {
            this.data = data;
            this.accessToken = accessToken;
            this.version = 1;
        }

        synchronized void update(JsonNode data, String accessToken) {
            this.data = data;
            this.accessToken = accessToken;
            this.version++;
        }
    }

    @PreDestroy
    public void shutdown() {
        System.out.println("SnapshotManager shutting down...");

        for (Long roomId : snapshots.keySet()) {
            try {
                saveImmediately(roomId);
            }
            catch (Exception e) {
                System.err.println("Failed to flush snapshot during shutdown | room=" + roomId + " | error=" + e.getMessage());
            }
        }

        scheduler.shutdown();

        try {

            if (!scheduler.awaitTermination(10, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }

        }
        catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }

        System.out.println("SnapshotManager shutdown complete");
    }
}