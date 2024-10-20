import { useAtom } from "jotai";
import {
  padStartAtom,
  timelineScrollRefAtom,
  timeoutRefAtom,
  timestampDefaultDurationAtom,
  timestampTextAtom,
  videoElAtom,
  videoLengthAtom
} from "./atoms";
import {
  parseTimestamps,
  timestampToSeconds
} from "./utils";
import { secondWidth } from "./consts";

export function ClickableTimestamps() {
  const [timestampText] = useAtom(timestampTextAtom);
  const [videoEl] = useAtom(videoElAtom);
  const player = videoEl!;
  const [padStart] = useAtom(padStartAtom);
  const [timelineScrollRef] = useAtom(timelineScrollRefAtom);
  const [videoLength] = useAtom(videoLengthAtom);
  const [timeoutRef] = useAtom(timeoutRefAtom);
  const [defaultDuration] = useAtom(timestampDefaultDurationAtom);

  const scrollEl = timelineScrollRef.current!;

  const timestamps = parseTimestamps(timestampText);
  const timestampSeconds = timestamps.map((tobject) => {
    return {
      start: timestampToSeconds(tobject.start),
      end: tobject.end ? timestampToSeconds(tobject.end) : timestampToSeconds(tobject.start) + defaultDuration,
      annotation: tobject.annotation
    };
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
      {timestamps.map((tobject, i) => {
        return (
          <div
            key={`${tobject.start}-${i}`}
            className="bg-gray-700 hover:bg-gray-600 select-none cursor-pointer p-2 rounded transition-colors"
            onClick={() => {
              const { start, end } = timestampSeconds[i];
              const timelineWidth = videoLength * secondWidth;
              const playPositionLeft = (start / player.duration) * timelineWidth;
              if (playPositionLeft < scrollEl.scrollLeft) {
                scrollEl.scrollLeft = playPositionLeft - 64;
              } else if (playPositionLeft + 64 >
                scrollEl.scrollLeft + scrollEl.clientWidth) {
                scrollEl.scrollLeft =
                  playPositionLeft - 64;
              }
              if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
              }
              player.play();
              player.currentTime = start - padStart;
              timeoutRef.current = window.setTimeout(
                () => {
                  player.pause();
                  player.currentTime = end;
                },
                (end - start + padStart) * 1000
              );
            }}
          >
            <div className="font-mono text-sm text-gray-300">
              {tobject.start}{tobject.end ? `-${tobject.end}` : ""}
            </div>
            <div className="text-sm truncate">
              {tobject.annotation ? `${tobject.annotation}` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

