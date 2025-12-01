import React, { useEffect, useState } from "react";

// --- TypeScript Definitions ---
// These define the shape of our data so the code editor can help us catch errors.

// A 'Segment' is one piece of the story (a single line of dialogue or narration).
type Segment = {
  type: "dialogue" | "narration"; // Is someone speaking, or is it descriptive text?
  speaker?: string;               // Who is speaking? (Optional, only for dialogue)
  expression_action?: string;     // What are they doing/feeling? (Optional)
  line?: string;                  // What did they say? (Optional)
  text?: string;                  // The narration text (Optional, only for narration)
};

// --- Data Structure: Doubly Linked List ---
// Instead of just using a simple array [0, 1, 2], we are using a "Linked List".
// Each item (Node) holds its own data AND points to the 'next' item and the 'prev' item.
// This makes it very easy to say "go to next" or "go to previous" without needing to know index numbers.

class SegmentNode {
  data: Segment;            // The actual story content
  prev: SegmentNode | null; // Pointer to the previous scene
  next: SegmentNode | null; // Pointer to the next scene

  constructor(data: Segment) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

/**
 * Helper Function: buildLinkedList
 * 
 * Converts a standard Array of segments into our Doubly Linked List structure.
 * Returns the 'head' (the first node) of the list.
 */
const buildLinkedList = (segments: Segment[]): SegmentNode | null => {
  let head: SegmentNode | null = null;
  let prev: SegmentNode | null = null;

  segments.forEach((seg) => {
    const node = new SegmentNode(seg); // Create a new node for this segment

    if (!head) head = node; // If it's the first one, mark it as the Head

    if (prev) {
      // Link the previous node to this new one
      prev.next = node;
      // Link this new node back to the previous one
      node.prev = prev;
    }

    // Move the 'prev' pointer to the current node for the next loop iteration
    prev = node;
  });

  return head;
};

/**
 * SegmentNavigator Component
 * 
 * A standalone component to demonstrate navigating through story segments.
 * NOTE: This seems to be a prototype or alternative to VNTextBox.
 * It uses a Linked List approach for navigation logic.
 */
export default function SegmentNavigator({ segments }: { segments: Segment[] }) {
  // 'current' holds the actual Node object we are currently viewing
  const [current, setCurrent] = useState<SegmentNode | null>(null);

  // When the 'segments' prop changes (e.g. new story loaded), rebuild the linked list
  useEffect(() => {
    const head = buildLinkedList(segments);
    setCurrent(head);
  }, [segments]);

  if (!current) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      {/* Display the Content */}
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

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          // Go to the 'prev' node. If null, this does nothing.
          onClick={() => setCurrent(current.prev)}
          // Disable button if there is no 'prev' node (we are at the start)
          disabled={!current.prev}
          className="bg-blue-500 disabled:bg-gray-400 px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          ← Prev
        </button>
        <button
          // Go to the 'next' node.
          onClick={() => setCurrent(current.next)}
          // Disable button if there is no 'next' node (we are at the end)
          disabled={!current.next}
          className="bg-green-500 disabled:bg-gray-400 px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
