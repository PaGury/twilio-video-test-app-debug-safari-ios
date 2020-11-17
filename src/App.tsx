import React, { useEffect, useState } from 'react';
import './App.css';
import video, { RemoteParticipant, Room } from 'twilio-video';
import { AudioTrackDisplay, VideoTrackDisplay } from './TwilioTrackComponent';

function App() {
  
  const [conversation, setConversation] = useState<Room | null>(null);
  const [videoTracks, setVideoTracks] = useState<any>([]);
  const [audioTracks, setAudioTracks] = useState<any>([]);

  useEffect(() => {
    const twilioKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzdmZWI3MmRkOTFlYzdjYTg3Nzc4N2FlNTM5NzBjYzVjLTE2MDU2MjIzNTQiLCJncmFudHMiOnsiaWRlbnRpdHkiOiIxNTNiZGVhNmM3YmM2NjMzYmIyYTk4OTRmMGZjODIzNDVmOWE5ZDU3NjM5NDYiLCJ2aWRlbyI6e319LCJpYXQiOjE2MDU2MjIzNTQsImV4cCI6MTYwNTYyNTk1NCwiaXNzIjoiU0s3ZmViNzJkZDkxZWM3Y2E4Nzc3ODdhZTUzOTcwY2M1YyIsInN1YiI6IkFDNTIxMzY3MTdiYWE4YjA4ZGJiYjY1NmE1MDA4ZTQ2MGIifQ.rMdfe3CyZmjV6gMAOoFVqKaZSilhNF4tXs6Ht3qa67Y';
    const conversationId = '26073bf2-7a02-45e2-90a5-b3a6b3fc6834';
    video.connect(twilioKey, {
      name: conversationId,
      tracks: [],
      logLevel: 'debug',
    }).then(room => {
      setConversation(room);


      function listenAndSetRemoteParticipantTracks(
        participant: RemoteParticipant
      ) {
        participant.tracks.forEach(publication => {
          if (publication.isSubscribed) {
            const { track } = publication;
            if (track) {
              if (track.kind === 'video') {
                setVideoTracks([...videoTracks, track]);
              }
        
              if (track.kind === 'audio') {
                setAudioTracks([...audioTracks, track]);
              }
            }
          }
        });

        participant.removeAllListeners('trackSubscribed');
        participant.on('trackSubscribed', track => {
          if (track.kind === 'video') {
            setVideoTracks([...videoTracks, track]);
          }
    
          if (track.kind === 'audio') {
            setAudioTracks([...audioTracks, track]);
          }
        });
        participant.on('trackUnsubscribed', track => {
          if (track.kind === 'video') {
            setVideoTracks([...videoTracks, track]);
          }
    
          if (track.kind === 'audio') {
            setAudioTracks([...audioTracks, track]);
          }
        });
      }

      room.participants.forEach(participant => {
        listenAndSetRemoteParticipantTracks(participant);
      });

      room.on('participantConnected', participant => {
        listenAndSetRemoteParticipantTracks(participant);
      });
    });
  }, []);

  return (
    <div className="App">
      coucou
      <header className="App-header">
        {videoTracks.map((track: any, index: number) => (<VideoTrackDisplay track={track} key={index}></VideoTrackDisplay>))}
        {audioTracks.map((track: any, index: number) => (<AudioTrackDisplay track={track} key={index}></AudioTrackDisplay>))}
      </header>
    </div>
  );
}

export default App;
