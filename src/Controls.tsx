import { useAtom, useSetAtom } from "jotai";
import {
  isPlayingAllAtom,
  isPlayingAtom,
  padStartAtom,
  playPositionAtom,
  timeoutRefAtom,
  timestampDefaultDurationAtom,
  timestampTextAtom,
  videoElAtom,
} from "./atoms";
import { parseTimestamps, timestampToSeconds } from "./utils";

export function Controls() {
  const [videoEl] = useAtom(videoElAtom);
  const [isPlaying] = useAtom(isPlayingAtom);
  const [timestampDefaultDuration, setTimestampDefaultDuration] = useAtom(
    timestampDefaultDurationAtom,
  );
  const [padStart, setPadStart] = useAtom(padStartAtom);
  const [timestampText] = useAtom(timestampTextAtom);
  const [timeoutRef] = useAtom(timeoutRefAtom);
  const setPlayPosition = useSetAtom(playPositionAtom);
  const [isPlayingAll, setIsPlayingAll] = useAtom(isPlayingAllAtom);
  const [defaultDuration] = useAtom(timestampDefaultDurationAtom);

  const timestamps = parseTimestamps(timestampText);
  const timestampSeconds = timestamps.map((tobject) => {
    return {
      start: timestampToSeconds(tobject.start),
      end: tobject.end
        ? timestampToSeconds(tobject.end)
        : timestampToSeconds(tobject.start) + defaultDuration,
      annotation: tobject.annotation,
    };
  });

  const player = videoEl!;

  return (
    <div className="flex flex-col md:flex-row justify-between select-none bg-gray-800 p-4 rounded-lg">
      <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
        <button
          className={`px-4 py-2 rounded-md ${
            isPlaying
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={() => (isPlaying ? player.pause() : player.play())}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          onClick={() => {
            player.currentTime = 0;
          }}
        >
          Reset
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            isPlayingAll
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={() => {
            if (isPlayingAll) {
              setIsPlayingAll(false);
              if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
              }
              player.pause();
            } else {
              setIsPlayingAll(true);
              function getNextTimestamp() {
                for (const range of timestampSeconds) {
                  const { start, end } = range;
                  if (start > player.currentTime) {
                    return [start, end];
                  }
                }
                return undefined;
              }
              function playTimestamps() {
                const nextTimestamp = getNextTimestamp();
                if (nextTimestamp !== undefined) {
                  const [nextStart] = nextTimestamp;
                  const nextEnd =
                    nextTimestamp[1] ?? nextStart + timestampDefaultDuration;
                  setPlayPosition(nextStart - padStart);
                  player.currentTime = nextStart - padStart;
                  player.play();
                  timeoutRef.current = window.setTimeout(
                    () => {
                      playTimestamps();
                    },
                    (nextEnd - nextStart + padStart) * 1000,
                  );
                } else {
                  player.pause();
                  setIsPlayingAll(false);
                }
              }
              playTimestamps();
            }
          }}
        >
          {isPlayingAll ? "Stop all timestamps" : "Play all timestamps"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Pad clip start:</label>
          <input
            type="number"
            step="0.1"
            className="w-20 px-2 py-1 bg-gray-700 text-white text-sm rounded"
            value={padStart}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPadStart(value);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Default clip duration:</label>
          <input
            type="number"
            step="0.1"
            className="w-20 px-2 py-1 bg-gray-700 text-white text-sm rounded"
            value={timestampDefaultDuration}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTimestampDefaultDuration(value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
