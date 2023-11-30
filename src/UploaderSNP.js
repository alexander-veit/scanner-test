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

const UploaderSNP = () => {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      window.snpFileName = file["name"];
      decompressBlob(file).then((v) => {
        
        const result = v.trim().split(/\r?\n/);
        const higlassData = [];
        result.forEach((r, i) => {
          if(i === 0){
            return
          }
          const segment = r.split('\t');
          higlassData.push([
            "chr"+segment[0], 
            parseInt(segment[1], 10),
            parseFloat(segment[2]),
          ])
        });
        //console.log(higlassData);

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
        t1.setSnpData(higlassData);

        hgc.api.setViewConfig(viewconfCohort);

      });
    });
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({ accept: { "application/gzip": ['.gz'] }, maxFiles: 1, onDrop });

  const style = useMemo(
    () => ({
      //...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div className="d-inline-block">
      <div {...getRootProps({style})}>
        <input {...getInputProps()} />
        <button className="btn btn-outline-primary">
          Click to upload
        </button>
      </div>
    </div>
  );
};

export default UploaderSNP;
