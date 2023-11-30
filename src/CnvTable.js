"use strict";

import React from "react";
import Uploader from "./Uploader";
import UploaderSNP from "./UploaderSNP";
import { ChromosomeInfo } from "higlass/dist/hglib";
import { format } from "d3-format";

const PAGE_SIZE = 30;

export class CnvTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      variants: [],
      displayedVariants: [],
      tablePage: 0,
    };
  }

  componentDidMount() {}

  populateTable = (data) => {
    const variants = [];

    ChromosomeInfo("//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv")
      // Now we can use the chromInfo object to convert
      .then((chromInfo) => {
        data.forEach((variant) => {
          const chrom = variant[0];
          const start = variant[1];
          const end = variant[2];
          const major_cn = variant[3];
          const minor_cn = variant[4];
          const total_cn = variant[5];
          const rdr = variant[6];
          const baf = variant[7];
          const cell = variant[8];

          variants.push({
            posAbs: chromInfo.chrToAbs([chrom, start]),
            chr: chrom,
            start: start,
            end: end,
            startStr: chrom + ":" + format(",.0f")(start),
            endStr: chrom + ":" + format(",.0f")(end),
            major_cn: major_cn,
            minor_cn: minor_cn,
            total_cn: total_cn,
            rdr: rdr,
            baf: baf,
            cell: cell,
          });
        });

        this.setState({
          variants: variants,
          displayedVariants: variants,
        });
      });
  };

  goToHiglass = (chr, start, end) => {
    const hgc = window.hgc.current;
    if (!hgc) {
      console.warn("Higlass component not found.");
      return;
    }
    document.getElementById("sec:visualization").scrollIntoView(true);

    setTimeout(() => {
      const viewconf = hgc.api.getViewConfig();

      ChromosomeInfo("//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv")
        // Now we can use the chromInfo object to convert
        .then((chromInfo) => {
          hgc.api.zoomTo(
            viewconf.views[0].uid,
            chromInfo.chrToAbs([chr, 0.9 * start]),
            chromInfo.chrToAbs([chr, 1.1 * end]),
            chromInfo.chrToAbs(["chr1", 0]),
            chromInfo.chrToAbs(["chr1", 1000]),
            2500 // Animation time
          );
        });
    }, "500");
  };

  render() {
    const cnvRows = [];

    const variantsToDisplay = this.state.displayedVariants.sort(
      (a, b) => a.posAbs - b.posAbs
    );
    const variantsToDisplaySliced = variantsToDisplay.slice(
      this.state.tablePage * PAGE_SIZE,
      (this.state.tablePage + 1) * PAGE_SIZE
    );

    variantsToDisplaySliced.forEach((variant) => {
      cnvRows.push(
        <tr>
          <td>{variant.startStr}</td>
          <td>{variant.endStr}</td>
          <td>{variant.major_cn}</td>
          <td>{variant.minor_cn}</td>
          <td>{variant.total_cn}</td>
          <td>{variant.rdr}</td>
          <td>{variant.baf}</td>
          <td className="text-nowrap">{variant.cell}</td>
          <td>
            <i
              className="fa fa-eye fas px-1 pointer"
              onClick={() =>
                this.goToHiglass(variant.chr, variant.start, variant.end)
              }
            ></i>
          </td>
        </tr>
      );
    });

    const tbody =
      cnvRows.length > 0 ? (
        <tbody>{cnvRows}</tbody>
      ) : (
        <tbody>
          <tr>
            <td colSpan={9} className="text-center p-5">
              <span className="text-secondary">
                <i className="fa fa-info-circle fas"></i>
              </span>
              <br />
              <span>Please upload the CNV output file from Scanner</span>
            </td>
          </tr>
        </tbody>
      );

    return (
      <React.Fragment>
        <div className="row mt-4">
          <div className="col-md-6 ">
            <div className="text-center">
              <div className="my-1">
                Scanner output <strong>CNV</strong> file (required)
              </div>
              <Uploader populateTable={(d) => this.populateTable(d)} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="text-center">
              <div className="my-1">
                Scanner output <strong>SNV</strong> file (optional)
              </div>
              <UploaderSNP />
            </div>
          </div>
        </div>

        <div className="h3">CNV table</div>
        <div className="row">
          <div className="col-md-3 col-xl-2">sdsds</div>
          <div className="col-md-9 col-xl-10">
            <div className="table-responsive-lg">
              <table className="table table-hover table-sm">
                <thead className="sticky-table-header bg-white">
                  <tr>
                    <th scope="col">Start</th>
                    <th scope="col">End</th>
                    <th scope="col">major_cn</th>
                    <th scope="col">minor_cn</th>
                    <th scope="col">total_cn</th>
                    <th scope="col">rdr</th>
                    <th scope="col">baf</th>
                    <th scope="col">cell</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                {tbody}
              </table>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
