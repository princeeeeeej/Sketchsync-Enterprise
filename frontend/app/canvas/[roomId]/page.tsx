import RoomCanvas from "@/components/RoomCanvas"

export const instant = false;

export default async function CanvasPage({params} : {params : {roomId: string}}){
    const roomId = (await params).roomId
    return (
        <div>
            <RoomCanvas roomId={roomId}/>
        </div>
    )
}