import Link from "next/link";
import { notFound } from "next/navigation";

import { readRoomDetailState, readRoomsState } from "@/modules/nexus-adapter/reader";

type RoomDetailPageProps = {
  params: Promise<{
    room: string;
  }>;
};

function renderMarkdownBlock(title: string, content: string | null) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <pre className="file-view">{content ?? "Not found."}</pre>
    </section>
  );
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { room } = await params;
  const rooms = await readRoomsState();
  const exists = rooms.some((entry) => entry.name === room);

  if (!exists) {
    notFound();
  }

  const detail = await readRoomDetailState(room);

  return (
    <div className="grid">
      <section className="panel">
        <h2>{detail.name}</h2>
        <p>
          Room detail is read directly from the underlying `.nexus` files. This is the
          first deep inspection view before editing flows are introduced.
        </p>
        <p>
          <Link href="/rooms">Back to rooms</Link>
        </p>
      </section>

      {renderMarkdownBlock("ROOM.md", detail.roomMarkdown)}
      {renderMarkdownBlock("PROMPT.md", detail.promptMarkdown)}
      {renderMarkdownBlock("CONTEXT.md", detail.contextMarkdown)}
    </div>
  );
}
