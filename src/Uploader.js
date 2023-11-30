import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";

async function decompressBlob(blob) {
  let ds = new DecompressionStream("gzip");
  let decompressedStream = blob.stream().pipeThrough(ds);
  return await new Response(decompressedStream).text();
}

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const Uploader = (props) => {
  
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      window.cnvFileName = file["name"];
      decompressBlob(file).then((v) => {
        const result = v.trim().split(/\r?\n/);
        const higlassData = [];
        result.forEach((r, i) => {
          if (i === 0) {
            return;
          }
          const segment = r.split("\t");
          higlassData.push([
            "chr" + segment[0],
            parseInt(segment[1], 10),
            parseInt(segment[2], 10),
            parseInt(segment[3], 10),
            parseInt(segment[4], 10),
            parseInt(segment[5], 10),
            parseFloat(segment[6]),
            parseFloat(segment[7]),
            segment[8],
          ]);
        });
        //console.log(higlassData);
        
        props.populateTable(higlassData);

        const hgc = window.hgc.current;
        const viewconfCohort = hgc.api.getViewConfig();
        const existingTracks = viewconfCohort.views[0].tracks.top;

        //console.log(hgc.api.getTrackObject("aa", "scanner-result-track-1"));

        existingTracks.forEach((track) => {
          if (track.uid === "scanner-text-track") {
            let text = "";
            if(window.cnvFileName){
              text += "CNV file: " + window.cnvFileName + "; "
            }
            if(window.snpFileName){
              text += "SNP file: " + window.snpFileName
            }
            track.options.text = text;

          }
        });

        const t1 = hgc.api.getTrackObject("aa", "scanner-result-track-1");
        t1.setData(higlassData);
        const t2 = hgc.api.getTrackObject("aa", "scanner-result-track-2");
        t2.setData(higlassData);

        hgc.api.setViewConfig(viewconfCohort);
      });
    });
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: { "application/gzip": [".gz"] },
      maxFiles: 1,
      onDrop,
    });

  const style = useMemo(
    () => ({
      ///...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div className="d-inline-block">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <button className="btn btn-outline-primary ">
          Click to upload
        </button>
      </div>
    </div>
  );
};

export default Uploader;

// import "react-dropzone-uploader/dist/styles.css";
// import Dropzone from "react-dropzone-uploader";
// import React from "react";

// // var fileReaderStream = require('filereader-stream')
// // window.Buffer = window.Buffer || require("buffer").Buffer;
// // window.process = {}

// async function decompressBlob(blob) {
//   let ds = new DecompressionStream("gzip");
//   let decompressedStream = blob.stream().pipeThrough(ds);
//   return await new Response(decompressedStream).text();
// }

// const Uploader = () => {
//   // specify upload params and url for your files
//   const getUploadParams = ({ meta }) => {
//     return { url: "https://httpbin.org/post" };
//   };

//   // called every time a file's `status` changes
//   const handleChangeStatus = ({ meta, file }, status) => {
//     console.log(status, meta, file);
//     if (status === "done") {
//       decompressBlob(file).then((v) => console.log(v));
//     }
//   };

//   // receives array of files that are done uploading when submit button is clicked
//   const handleSubmit = (files, allFiles) => {
//     //console.log(files.map(f => f.meta))
//     console.log(files);
//     //allFiles.forEach(f => f.remove())
//   };

//   return (
//     <Dropzone
//       getUploadParams={getUploadParams}
//       onChangeStatus={handleChangeStatus}
//       onSubmit={handleSubmit}
//     />
//   );
// };

// export default Uploader;
