import RoomCanvas from "@/components/RoomCanvas"

export const instant = false;

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
    return (
        <div>
            <RoomCanvas roomId={roomId}/>
        </div>
    )
}