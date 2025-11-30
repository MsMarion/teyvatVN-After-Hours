import React, { useEffect, useState } from "react";
import SegmentNavigator from "../components/vn/SegmentNavigator";
import fallbackScene from "../data/sample_scene.json";

const url = "https://script-deferred-sg-anthony.trycloudflare.com/data/dawn/chapter1/output.json";

// Define the type structure
type Segment = {
  type: "dialogue" | "narration";
  speaker?: string;
  expression_action?: string;
  line?: string;
  text?: string;
};

type Scene = {
  title: string;
  characters: string[];
  backgrounds: string[];
  setting_narration: string;
  segments: Segment[];
};

export default function TestScenePage() {
  const [scene, setScene] = useState<Scene>(fallbackScene as Scene);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("latestResult");

    if (local) {
      try {
        setScene(JSON.parse(local));
        setIsLoaded(true);
        return;
      } catch (e) {
        console.warn("LocalStorage data invalid, falling back to server fetch.");
      }
    }

    fetch(url)

      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        setScene(data);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn("Failed to fetch from backend server, using fallbackScene.json", err);
        setIsLoaded(true);
      });
  }, []);

  if (!isLoaded) return <div className="text-white p-6">Loading scene...</div>;

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">{scene.title}</h1>
      <p className="text-center italic text-gray-400 mb-6">
        {scene.setting_narration}
      </p>
      <SegmentNavigator segments={scene.segments as Segment[]} />
    </div>
  );
}
