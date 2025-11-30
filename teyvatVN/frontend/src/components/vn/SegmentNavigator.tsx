import React, { useEffect, useState } from "react";

// Type for each scene segment
type Segment = {
  type: "dialogue" | "narration";
  speaker?: string;
  expression_action?: string;
  line?: string;
  text?: string;
};

// Node in the doubly linked list
class SegmentNode {
  data: Segment;
  prev: SegmentNode | null;
  next: SegmentNode | null;

  constructor(data: Segment) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

// Build the linked list from segment array
const buildLinkedList = (segments: Segment[]): SegmentNode | null => {
  let head: SegmentNode | null = null;
  let prev: SegmentNode | null = null;

  segments.forEach((seg) => {
    const node = new SegmentNode(seg);
    if (!head) head = node;
    if (prev) {
      prev.next = node;
      node.prev = prev;
    }
    prev = node;
  });

  return head;
};

// React component
export default function SegmentNavigator({ segments }: { segments: Segment[] }) {
  const [current, setCurrent] = useState<SegmentNode | null>(null);

  useEffect(() => {
    const head = buildLinkedList(segments);
    setCurrent(head);
  }, [segments]);

  if (!current) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <div className="mb-4 bg-gray-800 p-4 rounded-xl shadow">
        {current.data.type === "dialogue" ? (
          <>
            <p className="font-semibold text-lg">
              {current.data.speaker}{" "}
              <span className="italic text-sm text-gray-400">
                {current.data.expression_action}
              </span>
            </p>
            <p className="mt-1">{current.data.line}</p>
          </>
        ) : (
          <p className="italic text-gray-300">{current.data.text}</p>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={() => setCurrent(current.prev)}
          disabled={!current.prev}
          className="bg-blue-500 disabled:bg-gray-400 px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          ← Prev
        </button>
        <button
          onClick={() => setCurrent(current.next)}
          disabled={!current.next}
          className="bg-green-500 disabled:bg-gray-400 px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
