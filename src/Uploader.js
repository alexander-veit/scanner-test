import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  BlobReader,
  BlobWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
} from "@zip.js/zip.js";

async function decompressBlob(blob) {
  let ds = new DecompressionStream("gzip");
  let decompressedStream = blob.stream().pipeThrough(ds);
  return await new Response(decompressedStream).text();
}

function parseHiglassData(v) {
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
  return higlassData;
}

async function readZip(blob, props) {
  const zipFileReader = new BlobReader(blob);

  const zipReader = new ZipReader(zipFileReader);
  const entries = await zipReader.getEntries();

  entries.forEach((entry) => {
    if (entry["filename"] === "cna_short.txt") {
      const writer = new TextWriter();
      entry.getData(writer).then((res) => {
        const higlassData = parseHiglassData(res);
        props.populateTable(higlassData);
      });
    } else if (entry["filename"] === "cna_long.txt") {
      const writer = new TextWriter();
      entry.getData(writer).then((res) => {
        const higlassData = parseHiglassData(res);
        const hgc = window.hgc.current;
        const viewconfCohort = hgc.api.getViewConfig();
        //const existingTracks = viewconfCohort.views[0].tracks.top;

        // existingTracks.forEach((track) => {
        //   if (track.uid === "scanner-text-track") {
        //     let text = "";
        //     if (window.cnvFileName) {
        //       text += "CNV file: " + window.cnvFileName + "; ";
        //     }
        //     if (window.snpFileName) {
        //       text += "SNP file: " + window.snpFileName;
        //     }
        //     track.options.text = text;
        //   }
        // });

        const t1 = hgc.api.getTrackObject("aa", "scanner-result-track-1");
        t1.setData(higlassData);
        const t2 = hgc.api.getTrackObject("aa", "scanner-result-track-2");
        t2.setData(higlassData);

        hgc.api.setViewConfig(viewconfCohort);
      });
    } else if (entry["filename"] === "snp.txt") {
      const writer = new TextWriter();
      entry.getData(writer).then((res) => {
        const result = res.trim().split(/\r?\n/);
        const higlassData = [];
        result.forEach((r, i) => {
          if (i === 0) {
            return;
          }
          const segment = r.split("\t");
          higlassData.push([
            "chr" + segment[0],
            parseInt(segment[1], 10),
            parseFloat(segment[2]),
          ]);
        });

        const hgc = window.hgc.current;
        const viewconfCohort = hgc.api.getViewConfig();

        const t1 = hgc.api.getTrackObject("aa", "scanner-result-track-1");
        t1.setSnpData(higlassData);

        hgc.api.setViewConfig(viewconfCohort);
      });
    }
  });

  await zipReader.close();
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
      readZip(file, props).then(() => {
        setTimeout(() => {
          const spinner = document.getElementById("upload-spinner");
          spinner.classList.add("collapse");
          document.getElementById("overlay").style.display = "none";
        }, "1000");
      });
    });
  }, []);

  const onDropAccepted = () => {
    const spinner = document.getElementById("upload-spinner");
    spinner.classList.remove("collapse");
    document.getElementById("overlay").style.display = "block";
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: { "application/zip": [".zip"] },
      maxFiles: 1,
      onDrop,
      onDropAccepted,
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
          <i
            id="upload-spinner"
            className="fas fa fa-spinner fa-spin mr-1 collapse"
          ></i>
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
