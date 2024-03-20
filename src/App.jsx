import { useState } from "react";
import Select from "react-dropdown-select";
import { getManufacturingOrders } from "./api/manufacturingOrders/getManufacturingOrders";

import "./App.css";
import items from "../items.json";
import { useEffect } from "react";
import { createInventoryWip } from "./api/wip/createInventoryWip";
import { createMoStatus } from "./api/mo/createMoStatus";
import { getMoStatuses } from "./api/mo/getMoStatuses";

function App() {
  let optionsMo = [];
  let sortedItems = items.sort((a, b) => a["itemId"] - b["itemId"]);
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedMo, setSelectedMo] = useState(
    localStorage.getItem("moNumber") ? localStorage.getItem("moNumber") : ""
  );
  const [selectedItem, setSelectedItem] = useState("");
  const [wipQty, setWipQty] = useState();
  const [user, setUser] = useState(
    localStorage.getItem("name")
      ? localStorage.getItem("name")
      : "Enter your Name"
  );

  const getMOs = async () => {
    const mos = await getManufacturingOrders();
    const statuses = await getMoStatuses();

    const mappedMos = mos.data.map((mo) => {
      const s = statuses.data.filter((m) => {
        return m.mohId === mo.mohId;
      });

      if (s.length === 0) {
        // console.log(mo);
        return mo;
      }
    });
    const filteredMos = mappedMos.filter((mo) => mo !== undefined);
    console.log(filteredMos);

    setManufacturingOrders(filteredMos);
    // mos.data.map((mo) => {
    //   optionsMo.push({ value: mo.mohId, label: mo.mohId });
    // });
    // setOptions(optionsMo);
  };

  useEffect(() => {
    getMOs();
  }, []);

  const handleSubmit = async (event) => {
    if (selectedItem === "") {
      alert("Select Item");
      return;
    }
    if (selectedMo === "") {
      alert("Select Mo#");
      return;
    }
    if (wipQty === undefined) {
      alert("Enter Wip qty");
      return;
    }
    event.preventDefault();
    await createInventoryWip({
      mohId: selectedMo,
      item: selectedItem,
      wipQty,
      user,
      lastUpdate: Date.now(),
    });

    window.location.reload();
  };

  const addFinishedMo = async () => {
    let text = "Are you sure?\nEither OK or Cancel.";
    if (confirm(text) == true) {
      await createMoStatus({
        mohId: selectedMo,
        status: true,
        user,
        lastUpdate: Date.now(),
      });
      localStorage.removeItem("moNumber");
      window.location.reload();
    } else {
      alert("You canceled!");
    }
  };

  const handleSubmitDone = async (event) => {
    event.preventDefault();
    addFinishedMo();
  };

  const getIndex = (array, keyName, keyvalue) => {
    const i = array.findIndex((mo) => mo[keyName] === keyvalue);
    // alert(i);
    return i;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="container">
          <div className="subContainer" style={{ marginBottom: "60px" }}>
            <div className="subContainer2 flexRight">
              <div>Name</div>
            </div>
            <div className="subContainer2 flexLeft">
              <input
                value={user}
                type="text"
                style={{ width: "150px" }}
                onChange={(e) => {
                  localStorage.setItem("name", e.target.value);
                  setUser(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="subContainer">
            <div className="subContainer2 flexRight">
              <div>MO #</div>
            </div>
            <div className="subContainer2 flexLeft" id="selectMo">
              <Select
                options={manufacturingOrders}
                labelField="mohId"
                valueField="mohId"
                values={
                  localStorage.getItem("moNumber") &&
                  manufacturingOrders.length > 0
                    ? [
                        manufacturingOrders[
                          getIndex(
                            manufacturingOrders,
                            "mohId",
                            localStorage.getItem("moNumber")
                          )
                        ],
                      ]
                    : []
                }
                placeholder="Select mo number"
                style={{
                  width: "200px",
                  paddingLeft: "10px",
                }}
                separator={true}
                onChange={(values) => {
                  localStorage.setItem("moNumber", values[0].mohId);
                  setSelectedMo(values[0].mohId);
                  // console.log(values[0]);
                }}
              />
            </div>
          </div>
          <div className="subContainer">
            <div className="subContainer2 flexRight">
              <div>ITEM</div>
            </div>
            <div className="subContainer2 flexLeft">
              <Select
                options={sortedItems}
                labelField="itemId"
                valueField="itemId"
                values={
                  selectedItem === ""
                    ? []
                    : [{ value: selectedItem, label: selectedItem }]
                }
                placeholder="Select item number"
                style={{ width: "200px" }}
                separator={true}
                onChange={(values) => {
                  setSelectedItem(values[0].itemId);
                  // console.log(values[0]);
                }}
              />
            </div>
          </div>
          <div className="subContainer">
            <div className="subContainer2 flexRight">
              <div>WIP Qty</div>
            </div>
            <div className="subContainer2 flexLeft">
              <input
                type="number"
                style={{ width: "200px" }}
                onChange={(e) => setWipQty(e.target.value)}
                value={wipQty}
              />
            </div>
          </div>
          <div className="subContainer">
            <input type="submit" value="Add Wip" />
          </div>
        </div>
      </form>
      <form onSubmit={handleSubmitDone}>
        <div className="subContainer" style={{ marginTop: "60px" }}>
          <div className="subContainer">
            <input type="submit" value={`Done with MO ${selectedMo}`} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;
