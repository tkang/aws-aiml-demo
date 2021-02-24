import MyHead from "../components/MyHead";
import MyFooter from "../components/MyFooter";
import MyNav from "../components/MyNav";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Storage, API, graphqlOperation } from "aws-amplify";
import * as queries from "../src/graphql/queries";
import * as subscriptions from "../src/graphql/subscriptions";

const DEFAULT_IMAGE_SCORE_DIFF_THRESHOLD = 5000;

const PIXEL_SCORE_THRESHOLD = 50;

function calculateImageScore(imageData) {
  let imageScore = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    let r = imageData.data[i] / 3;
    let g = imageData.data[i + 1] / 3;
    let b = imageData.data[i + 2] / 3;
    let pixelScore = r + g + b;
    if (pixelScore >= PIXEL_SCORE_THRESHOLD) {
      imageScore++;
    }
  }
  return imageScore;
}

function getDiff(x, y) {
  return Math.abs(x - y);
}

export default function MotionDetect({ user }) {
  return (
    <div className="container mx-auto">
      <MyHead title="Motion Detect Demo" />
      <MyNav user={user} />

      <main className="justify-center items-center flex flex-1 flex-col">
        <h1 className="text-3xl text-center">Motion Detect Demo</h1>
        <VideoSection />
      </main>

      <MyFooter />
    </div>
  );
}

const useLabels = () => {
  const [labels, setLabels] = useState([]);
  let [subscription, setSubscription] = useState(null);

  useEffect(() => {
    setSubscription(subscribeToLabelCreate());

    //return () => subscription.unsubscribe();
  }, []);

  const subscribeToLabelCreate = async () => {
    const s = await API.graphql(
      graphqlOperation(subscriptions.onCreateImageData)
    );
    s.subscribe({
      next: ({ provider, value }) => {
        console.log({ provider, value });
      },
    });
    return s;
  };

  return { labels, setLabels };
};

const useIsActive = () => {
  const [isActive, setIsActive] = useState(false);
  return { isActive, setIsActive };
};

const useMovementDetected = () => {
  const [movementDetected, setMovementDetected] = useState(false);
  return { movementDetected, setMovementDetected };
};

const DEFAULT_MIN_CONFIDENCE = 50;

function VideoSection() {
  const [video, setVideo] = useState(null);
  const [canvas, setCanvas] = useState({});
  const [imageContext, setImageContext] = useState({});

  const [streamWidth, setStreamWidth] = useState(null);
  const [streamHeight, setStreamHeight] = useState(null);
  const { isActive, setIsActive } = useIsActive();
  const { movementDetected, setMovementDetected } = useMovementDetected();

  const [imageScore, setImageScore] = useState(0);
  const [scoreDiff, setScoreDiff] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { labels, setLabels } = useLabels();
  const [minConfidence, setMinConfidence] = useState(DEFAULT_MIN_CONFIDENCE);
  const [imageScoreDiffThreshold, setImageScoreDiffThreshold] = useState(
    DEFAULT_IMAGE_SCORE_DIFF_THRESHOLD
  );
  useEffect(() => {
    console.log("hello");
    const v = document.getElementById("video");
    const c = document.getElementById("canvas");
    const ic = c.getContext("2d");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        let height = stream.getVideoTracks()[0].getSettings().height;
        let width = stream.getVideoTracks()[0].getSettings().width;
        if (width > 1000) {
          height = height / 2;
          width = width / 2;
        }
        setStreamWidth(width);
        setStreamHeight(height);
        // https://stackoverflow.com/questions/53626318/chrome-update-failed-to-execute-createobjecturl-on-url/53734174
        try {
          v.src = window.URL.createObjectURL(stream);
        } catch (error) {
          v.srcObject = stream;
        }
        v.play();
      });
    }

    setVideo(v);
    setCanvas(c);
    setImageContext(ic);
  }, []);

  useEffect(() => {
    let intervalId;
    if (isActive) {
      const score = calculateCurrentImageScore();
      setImageScore(score);
      intervalId = setInterval(() => {
        checkImageDiff();
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isActive]);

  useEffect(() => {
    if (scoreDiff <= imageScoreDiffThreshold) {
      console.log("No movement detected...");
      return;
    }

    setMovementDetected(true);
  }, [scoreDiff]);

  useEffect(() => {
    if (movementDetected) {
      console.log("movement detected...");
      stopTracking();
      setTimeout(() => {
        console.log("restarting tracking...");
        startTracking();
        setMovementDetected(false);
      }, 5000);
      saveImageFromCanvas();
    }
  }, [movementDetected]);

  const startTracking = () => {
    console.log("Start tracking");
    setIsActive(true);
  };

  const stopTracking = () => {
    console.log("Stop tracking -----");
    setIsActive(false);
  };

  const calculateCurrentImageScore = () => {
    imageContext.drawImage(video, 0, 0, streamWidth, streamHeight);
    const imageData = imageContext.getImageData(
      0,
      0,
      streamWidth,
      streamHeight
    );
    const score = calculateImageScore(imageData);
    return score;
  };

  const checkImageDiff = () => {
    const newScore = calculateCurrentImageScore();
    const prevScore = imageScore;
    const diff = getDiff(newScore, prevScore);

    setImageScore(newScore);
    setScoreDiff(diff);

    console.log("prevScore = ", prevScore);
    console.log("newScore = ", newScore);
    console.log("diff: ", diff);
  };

  const createImageFile = () => {
    let image = new Image();
    image.id = "pic" + uuidv4();
    let canvas = document.getElementById("canvas");
    image.src = canvas.toDataURL();
    let blobBin = atob(image.src.split(",")[1]);
    let array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    let file = new Blob([new Uint8Array(array)], { type: "image/jpg" });
    const fileName = `images/${uuidv4()}_snapshot.jpg`;
    console.log("fileName: ", fileName);

    return { file, fileName };
  };

  const saveImageFromCanvas = () => {
    const { file, fileName } = createImageFile();
    processImage({ fileName, file });
  };

  const processImage = async ({ fileName, file }) => {
    setIsProcessing(true);
    try {
      const storagePutResult = await Storage.put(fileName, file);
      console.log(storagePutResult);
      const imageInfo = { imageKey: fileName, minConfidence };
      const data = await API.graphql(
        graphqlOperation(queries.processImage, imageInfo)
      );
      const rekognitionData = JSON.parse(
        data.data.processImage.rekognitionData
      );
      console.log("data processed at = ", data.data.processImage);
      console.log("rekognitionData: ", rekognitionData);
      setLabels(rekognitionData.Labels);
      //await Storage.remove(fileName);
    } catch (error) {
      console.log("error: ", error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="p-2">
      <video
        id="video"
        style={{ height: streamHeight }}
        width={streamWidth}
        autoPlay
      >
        <canvas
          id="canvas"
          style={{
            position: "absolute",
            margineLeft: -9999,
            height: streamHeight,
          }}
        ></canvas>
      </video>
      <div className="flex items-center justify-center">
        {movementDetected ? (
          <div className="text-xl p-2">Movement Detected!</div>
        ) : (
          <>
            {!isActive ? (
              <>
                <div>
                  Min Confidence (~99)
                  <input
                    className="border border-black p-2 m-2"
                    value={minConfidence}
                    onChange={(e) =>
                      setMinConfidence(e.target.value.replace(/\D/, ""))
                    }
                  ></input>
                </div>
                <button
                  className="border text-xl p-3 m-2"
                  onClick={startTracking}
                >
                  Start Tracking
                </button>
              </>
            ) : (
              <button className="border text-xl p-3 m-2" onClick={stopTracking}>
                Stop Tracking
              </button>
            )}
          </>
        )}
      </div>
      <div className="p-2">
        {/*
        <div>
          Score Diff Threshold :{" "}
          <input
            className="border border-black p-2 m-2"
            value={imageScoreDiffThreshold}
            onChange={(e) =>
              setImageScoreDiffThreshold(e.target.value.replace(/\D/, ""))
            }
          ></input>
        </div>
          */}
        <ScoreSection
          imageScore={imageScore}
          scoreDiff={scoreDiff}
          imageScoreDiffThreshold={imageScoreDiffThreshold}
        />
      </div>
      {isProcessing && <div className="p-2 text-xl">Processing...</div>}
      <Labels labels={labels} />
    </div>
  );
}

function ScoreSection({ imageScore, scoreDiff, imageScoreDiffThreshold }) {
  return (
    <div>
      <div>Current Score = {imageScore}</div>
      <div
        className={scoreDiff >= imageScoreDiffThreshold ? "text-red-500" : ""}
      >
        Diff from Previous = {scoreDiff}
      </div>
    </div>
  );
}

function Labels({ labels }) {
  if (labels.length === 0) return <div></div>;

  return (
    <div className="p-2">
      {labels.map((label) => (
        <div key={label.Name}>
          {label.Name} (score = {label.Confidence})
        </div>
      ))}
    </div>
  );
}
