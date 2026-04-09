import Link from "next/link";
import type { Route } from "next";

import { readRoomsState } from "@/modules/nexus-adapter/reader";

export default async function RoomsPage() {
  const rooms = await readRoomsState();

  return (
    <div className="grid">
      {rooms.map((room) => (
        <section className="panel" key={room.name}>
          <h2>
            <Link href={`/rooms/${room.name}` as Route}>{room.name}</Link>
          </h2>
          <ul className="list">
            <li>ROOM.md: {room.roomExists ? "present" : "missing"}</li>
            <li>PROMPT.md: {room.promptExists ? "present" : "missing"}</li>
            <li>CONTEXT.md: {room.contextExists ? "present" : "missing"}</li>
            <li>Phase: {room.currentState ?? "unknown"}</li>
            <li>Next action: {room.nextAction ?? "not set"}</li>
          </ul>
        </section>
      ))}
    </div>
  );
}
