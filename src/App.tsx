import { useAtom } from "jotai";
import {
  videoElAtom,
} from "./atoms";
import { VideoInput } from "./VideoInput";
import { Video } from "./Video";
import { VideoState } from "./VideoState";
import { Controls } from "./Controls";
import { Timelines } from "./Timelines";
import { ClickableTimestamps } from "./ClickableTimestamps";
import { TimestampText } from "./TimestampText";
import { Annotations } from "./Annotations";
import { Gemini } from "./Gemini";

function App() {
  const [videoEl] = useAtom(videoElAtom);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Gemini Video Scrubber</h1>
      <Video />
      {videoEl ? (
        <div className="space-y-4">
          <Annotations />
          <Controls />
          <Timelines />
          <ClickableTimestamps />
          <VideoState />
          <Gemini />
          <TimestampText />
        </div>
      ) : (
        <VideoInput />
      )}
    </div>
  );
}

export default App;
