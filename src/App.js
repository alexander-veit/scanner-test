import React from "react";
import "./App.css";
import { Facets } from "./Facets";
import "bootstrap/dist/css/bootstrap.min.css";
import { HiglassBrowser } from "./HiglassBrowser";
import { CnvTable } from "./CnvTable";

function App() {
  return (
    <div className="App">
      {/* <div className="container">
        <div className="row">
          <div className="col">
            <h1 className="my-5">Scanner output visualization</h1>
            <Uploader></Uploader>
          </div>
        </div>
      </div> */}

      <div className="container mt-5">
        <h2 id="variant-view" className="text-center">
          Scanner output visualization
        </h2>
        <CnvTable />

        <div className="h3" id="sec:visualization">
          Interactive visualization
        </div>
        <div className="row mt-4">
          <div className="col-md-3 ">
            <div className="border p-2 mt-3">
              <Facets />
            </div>
          </div>
          <div className="col-md-9">
            <div className="fixedHeight">
              <HiglassBrowser />
            </div>
          </div>
        </div>
        <div className="py-5">
        </div>
        <div className="py-5">
        </div>
      </div>
    </div>
  );
}

export default App;
