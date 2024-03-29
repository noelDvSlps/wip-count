import { useState } from "react";
import Select from "react-dropdown-select";
import { getManufacturingOrders } from "./api/manufacturingOrders/getManufacturingOrders";

import "./App.css";
import items from "../items.json";
import itemsAxs from "../itemsAxs.json";
import { useEffect } from "react";
import { createInventoryWip } from "./api/wip/createInventoryWip";
import { createMoStatus } from "./api/mo/createMoStatus";
import { getMoStatuses } from "./api/mo/getMoStatuses";
import { getInventoryWips } from "./api/wip/getInventoryWips";
import { updateWip } from "./api/wip/updateWip";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";

function App() {
  let newArr = [];
  itemsAxs.map((itemAxs) => {
    // console.log(itemAxs);
    const f = items.filter((item) => {
      return item.itemId === itemAxs.itemId;
    });
    if (f.length === 0) {
      newArr.push(itemAxs);
      return itemAxs;
    }
  });

  items.map((item) => newArr.push(item));

  // console.log(newArr);
  let sortedItems = newArr.sort((a, b) => a["itemId"] - b["itemId"]);
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [selectedMo, setSelectedMo] = useState(
    localStorage.getItem("moNumber") ? localStorage.getItem("moNumber") : ""
  );
  const [selectedItem, setSelectedItem] = useState("");
  const [wipQty, setWipQty] = useState();
  const [inventoryWips, setInventoryWips] = useState([]);
  const [user, setUser] = useState(
    localStorage.getItem("name") ? localStorage.getItem("name") : ""
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

    setManufacturingOrders(filteredMos);
  };

  const getWips = async () => {
    const wips = await getInventoryWips();
    setInventoryWips(wips.data);
  };

  useEffect(() => {
    getMOs();
  }, []);

  useEffect(() => {
    getWips();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (user === "") {
      handleShow("Enter Name");
      return;
    }
    if (selectedMo === "") {
      handleShow("Select Mo#");
      return;
    }
    if (selectedItem === "") {
      handleShow("Select Item");
      return;
    }

    if (wipQty === undefined || wipQty === "") {
      alert("Enter Wip qty");
      return;
    }

    const checkDupes = inventoryWips.filter(
      (wip) => wip.mohId === selectedMo && wip.item === selectedItem
    );

    const dupes = checkDupes.length > 0 ? true : false;

    if (dupes === true) {
      const id = checkDupes[0]._id;
      await updateWip(
        id,
        {
          mohId: selectedMo,
          item: selectedItem,
          wipQty,
          user,
          lastUpdate: Date.now(),
        },
        "noToken"
      );
    } else {
      await createInventoryWip({
        mohId: selectedMo,
        item: selectedItem,
        wipQty,
        user,
        lastUpdate: Date.now(),
      });
    }

    window.location.reload();
  };

  const addFinishedMo = async () => {
    // let text = "Are you sure?\nEither OK or Cancel.";
    // if (confirm(text) == true) {
    await createMoStatus({
      mohId: selectedMo,
      status: true,
      user,
      lastUpdate: Date.now(),
    });
    localStorage.removeItem("moNumber");
    window.location.reload();

    // } else {
    //   alert("You canceled!");
    // }
  };

  const handleSubmitDone = async (event) => {
    event.preventDefault();
    handleShowDone(
      `Are you sure you are done with MO# ${localStorage.getItem("moNumber")}?`
    );
    // addFinishedMo();
  };

  const getIndex = (array, keyName, keyvalue) => {
    const i = array.findIndex((mo) => mo[keyName] === keyvalue);
    // alert(i);
    if (i === -1) {
      localStorage.removeItem("moNumber");
      window.location.reload();
    } else {
      return i;
    }
  };

  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = (message) => {
    setMsg(message);
    setShow(true);
  };

  const [showDone, setShowDone] = useState(false);
  const [msgDone, setMsgDone] = useState("");

  const handleCloseDone = () => setShowDone(false);
  const handleShowDone = (message) => {
    setMsgDone(message);
    setShowDone(true);
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{msg}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {/* <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button> */}
        </Modal.Footer>
      </Modal>
      <Modal show={showDone} onHide={handleCloseDone}>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{msgDone}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDone}>
            No
          </Button>
          <Button variant="primary" onClick={addFinishedMo}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      <form onSubmit={handleSubmit}>
        <div className="container">
          <div className="subContainer" style={{ marginBottom: "60px" }}>
            <div className="subContainer2 flexRight">
              <div>Name</div>
            </div>
            <div className="subContainer2 flexLeft">
              <input
                placeholder="Enter Name"
                value={user}
                type="text"
                style={{ width: "200px" }}
                onChange={(e) => {
                  localStorage.setItem(
                    "name",
                    e.target.value.trim().toUpperCase()
                  );
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
                inputMode="numeric"
                pattern="[0-9]*"
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
                  localStorage.setItem(
                    "moNumber",
                    values[0] ? values[0].mohId : ""
                  );
                  setSelectedMo(values[0] ? values[0].mohId : "");
                  // console.log(values[0]);
                }}
              />
            </div>
          </div>
          <div className="subContainer">
            <div className="subContainer2 flexRight">
              <div>SUB ITEM</div>
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
                  setSelectedItem(values[0] ? values[0].itemId : "");
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
                step="0.001"
                onChange={(e) => setWipQty(e.target.value)}
                value={wipQty}
              />
            </div>
          </div>
          <div
            className="subContainer"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button variant="primary" onClick={handleSubmit}>
              Add Wip
            </Button>
          </div>
        </div>
      </form>
      {selectedMo !== "" && (
        <form onSubmit={handleSubmitDone}>
          <div
            className="subContainer"
            style={{
              marginTop: "60px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "100%" }}>
              <Button
                variant="success"
                onClick={handleSubmitDone}
              >{`Done with MO ${selectedMo}`}</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default App;
