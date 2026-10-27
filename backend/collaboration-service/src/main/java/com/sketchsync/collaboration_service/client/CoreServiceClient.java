package com.sketchsync.collaboration_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

@Component
public class CoreServiceClient {

    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    public CoreServiceClient(
            @Value("${app.core-service.url:http://localhost:8081}")
            String coreServiceUrl,
            JsonMapper jsonMapper
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(coreServiceUrl)
                .build();

        this.jsonMapper = jsonMapper;
    }

    public boolean isMember(Long roomId, String accessToken) {
        System.out.println("Checking membership | roomId=" + roomId);

        Boolean result = restClient
                .get()
                .uri(
                        "/api/rooms/{roomId}/membership",
                        roomId
                )
                .header(
                        "Authorization",
                        "Bearer " + accessToken
                )
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        (request, response) -> {
                            System.err.println("Core service returned: " + response.getStatusCode());
                        }
                )
                .body(Boolean.class);

        System.out.println("Core membership response: " + result);
        return Boolean.TRUE.equals(result);
    }

    public void saveSnapshot(Long roomId, String accessToken, JsonNode data) {

        System.out.println("Saving snapshot to core | roomId=" + roomId);

        ObjectNode requestBody = jsonMapper.createObjectNode();

        requestBody.set("data", data);

        System.out.println("Snapshot request body: " + requestBody);

        restClient
                .post()
                .uri(
                        "/api/canvas/{roomId}",
                        roomId
                )
                .header(
                        "Authorization",
                        "Bearer " + accessToken
                )
                .header(
                        "Content-Type",
                        "application/json"
                )
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();

        System.out.println("Snapshot saved successfully | roomId=" + roomId);
    }

    public JsonNode getSnapshot(Long roomId, String accessToken) {

        System.out.println("Getting snapshot from core | roomId=" + roomId);

        JsonNode result = restClient
                .get()
                .uri(
                        "/api/canvas/{roomId}",
                        roomId
                )
                .header(
                        "Authorization",
                        "Bearer " + accessToken
                )
                .retrieve()
                .body(JsonNode.class);

        System.out.println("Snapshot retrieved | roomId=" + roomId);
        return result;
    }
}