import React, { useRef, useEffect } from 'react';
import { VideoTrack, AudioTrack } from 'twilio-video';
import classNames from 'classnames';

type Props = {
  className?: string;
  track: VideoTrack | AudioTrack;
};

export const TrackDisplay = ({ track, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && track) {
      const element = track.attach();
      ref.current.appendChild(element);

/*      if (track.kind === 'audio') {
        setTimeout(() => {
          element.pause();
          element.play();
        }, 2000);
      }*/
    }
  }, [track, ref]);

  return <div className={className} style={{ background: track.kind === 'audio' ? 'orange' : 'blue', width: '200px', height: '200px' }} ref={ref} />;
};

type VideoTrackProps = {
  track: VideoTrack;
  className?: string;
  isMirroredTrack?: boolean;
};

export const VideoTrackDisplay = ({
  track,
  className,
  isMirroredTrack = false,
}: VideoTrackProps) => (
  <TrackDisplay
    track={track}
    className={classNames(className)}
  />
);

type AudioTrackProps = {
  className?: string;
  track: AudioTrack;
};

export const AudioTrackDisplay = ({ track, className }: AudioTrackProps) => (
  <TrackDisplay track={track} className={className} />
);
