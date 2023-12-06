"use strict";

import React from "react";
import Uploader from "./Uploader";
import { ChromosomeInfo } from "higlass/dist/hglib";
import { format } from "d3-format";
import Select from "react-select";

const PAGE_SIZE = 20;

const ALL_CHROM = { value: "All", label: "All" };

const CHROMS = [
  { value: "All", label: "All" },
  { value: "chr1", label: "chr1" },
  { value: "chr2", label: "chr2" },
  { value: "chr3", label: "chr3" },
  { value: "chr4", label: "chr4" },
  { value: "chr5", label: "chr5" },
  { value: "chr6", label: "chr6" },
  { value: "chr7", label: "chr7" },
  { value: "chr8", label: "chr8" },
  { value: "chr9", label: "chr9" },
  { value: "chr10", label: "chr10" },
  { value: "chr11", label: "chr11" },
  { value: "chr12", label: "chr12" },
  { value: "chr13", label: "chr13" },
  { value: "chr14", label: "chr14" },
  { value: "chr15", label: "chr15" },
  { value: "chr16", label: "chr16" },
  { value: "chr17", label: "chr17" },
  { value: "chr18", label: "chr18" },
  { value: "chr19", label: "chr19" },
  { value: "chr20", label: "chr20" },
  { value: "chr21", label: "chr21" },
  { value: "chr22", label: "chr22" },
];

export class CnvTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      variants: [],
      displayedVariants: [],
      tablePage: 0,
      selectedChrom: ALL_CHROM,
      sortedBy: "",
      sortedByOrder: "asc"
    };
  }

  componentDidMount() {}

  nextPage = () => {
    this.setState((prevState) => ({
      tablePage: prevState.tablePage + 1,
    }));
  };

  previousPage = () => {
    this.setState((prevState) => ({
      tablePage: prevState.tablePage - 1,
    }));
  };

  sortTable = (value) => {
    const displayedVariants = JSON.parse(JSON.stringify(this.state.displayedVariants));
    displayedVariants.sort((a, b) => {
      if(a[value] === "-"){
        return -1
      }
      if(b[value] === "-"){
        return 1
      }
      return a[value] > b[value] ? 1 : b[value] > a[value] ? -1 : 0;
    });

    let sortedByOrder = this.state.sortedByOrder;

    if(this.state.sortedBy === value && sortedByOrder === "asc"){
      // Reverse sort
      console.log("reverse")
      displayedVariants.reverse();
      sortedByOrder = "desc";
    }
    else{
      sortedByOrder = "asc";
    }

    this.setState({
      displayedVariants: displayedVariants,
      sortedBy: value,
      sortedByOrder: sortedByOrder
    });
  };

  selectChrom = (selectedChrom) => {
    //this.state.displayedVariants.sort((a, b) => a.posAbs - b.posAbs);
    if (selectedChrom.value === "All") {
      this.setState({
        displayedVariants: this.state.variants,
        selectedChrom: ALL_CHROM,
      });
      return;
    }

    const displayedVariants = [];
    this.state.variants.forEach((v) => {
      if (v.chr === selectedChrom.value) {
        displayedVariants.push(v);
      }
    });

    this.setState({
      displayedVariants: displayedVariants,
      selectedChrom: selectedChrom,
    });
  };

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
          const rdr = variant[6] || "-";
          const baf = variant[7] || "-";

          variants.push({
            posAbs: chromInfo.chrToAbs([chrom, start]),
            chr: chrom,
            start: start,
            end: end,
            startStr: format(",.0f")(start),
            endStr: format(",.0f")(end),
            major_cn: major_cn,
            minor_cn: minor_cn,
            total_cn: total_cn,
            rdr: rdr,
            baf: baf,
          });
        });

        variants.sort((a, b) => a.posAbs - b.posAbs);

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
            chromInfo.chrToAbs([chr, start]),
            chromInfo.chrToAbs([chr, end]),
            chromInfo.chrToAbs(["chr1", 0]),
            chromInfo.chrToAbs(["chr1", 1000]),
            2500 // Animation time
          );
        });
    }, "500");
  };

  render() {
    const cnvRows = [];

    // const variantsToDisplay = this.state.displayedVariants.sort(
    //   (a, b) => a.posAbs - b.posAbs
    // );
    const variantsToDisplay = this.state.displayedVariants;
    const variantsToDisplaySliced = this.state.displayedVariants.slice(
      this.state.tablePage * PAGE_SIZE,
      (this.state.tablePage + 1) * PAGE_SIZE
    );

    variantsToDisplaySliced.forEach((variant) => {
      cnvRows.push(
        <tr>
          <td>{variant.chr}</td>
          <td>{variant.startStr}</td>
          <td>{variant.endStr}</td>
          <td>{variant.major_cn}</td>
          <td>{variant.minor_cn}</td>
          <td>{variant.total_cn}</td>
          <td>{variant.rdr}</td>
          <td>{variant.baf}</td>
          <td className="text-center">
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
              <span>
                Please upload the visualization output file from Scanner
              </span>
            </td>
          </tr>
        </tbody>
      );

    const navButtons = [];

    if (
      variantsToDisplay.length > PAGE_SIZE &&
      (this.state.tablePage + 1) * PAGE_SIZE <= variantsToDisplay.length
    ) {
      navButtons.push(
        <button className="btn btn-primary btn-sm" onClick={this.nextPage}>
          Next
        </button>
      );
    }

    if (this.state.tablePage > 0) {
      navButtons.push(
        <button
          className="btn btn-primary btn-sm mx-2"
          onClick={this.previousPage}
        >
          Previous
        </button>
      );
    }

    let message = "";
    if (variantsToDisplay.length > 0) {
      message = `Displaying variants ${
        this.state.tablePage * PAGE_SIZE + 1
      }-${Math.min(
        (this.state.tablePage + 1) * PAGE_SIZE,
        variantsToDisplay.length
      )} of ${variantsToDisplay.length}`;
    }

    return (
      <React.Fragment>
        <div className="row mt-4 mb-5">
          <div className="col-12 ">
            <div className="text-center">
              <div className="my-1">
                Scanner visualization output file (required)
              </div>
              <Uploader populateTable={(d) => this.populateTable(d)} />
            </div>
          </div>
        </div>

        <div className="h3">Variant browser</div>

        <div className="d-flex flex-row-reverse mb-2">
          {navButtons}
          <div className="pt-1 mx-2">{message}</div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="table-responsive-lg">
              <table className="table table-hover table-sm">
                <thead className="sticky-table-header bg-white">
                  <tr>
                    <th scope="col">
                      Chrom.{" "}
                      <Select
                        className="basic-single d-inline-block"
                        value={this.state.selectedChrom}
                        onChange={this.selectChrom}
                        options={CHROMS}
                        closeMenuOnSelect={true}
                        placeholder="Select ..."
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    </th>
                    <th scope="col">
                      Start{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("start")}
                      ></i>
                    </th>
                    <th scope="col">
                      End{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("end")}
                      ></i>
                    </th>
                    <th scope="col">
                      major_cn{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("major_cn")}
                      ></i>
                    </th>
                    <th scope="col">
                      minor_cn{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("minor_cn")}
                      ></i>
                    </th>
                    <th scope="col">
                      total_cn{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("total_cn")}
                      ></i>
                    </th>
                    <th scope="col">
                      RDR{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("rdr")}
                      ></i>
                    </th>
                    <th scope="col">
                      BAF{" "}
                      <i
                        className="fas fa fa-sort fa-fw sort-table-icon"
                        onClick={() => this.sortTable("baf")}
                      ></i>
                    </th>
                    <th className="text-center" scope="col">
                      Inspect region
                    </th>
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
