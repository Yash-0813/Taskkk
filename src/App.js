import React, { useState, useEffect } from "react";
import { MoreHoriz } from "@mui/icons-material";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import axios from "axios";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import SignalCellularAlt2BarIcon from "@mui/icons-material/SignalCellularAlt2Bar";
import SignalCellularAlt1BarIcon from "@mui/icons-material/SignalCellularAlt1Bar";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TonalityIcon from "@mui/icons-material/Tonality";
import CancelIcon from "@mui/icons-material/Cancel";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import CircleIcon from "@mui/icons-material/Circle";
import { groupBy, orderBy } from "lodash";
import "./App.css";

const API_URL = "https://api.quicksell.co/v1/internal/frontend-assignment";

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [groupingOption, setGroupingOption] = useState("status");
  const [sort, setSort] = useState("priority");
  const [optionsVisible, setOptionsVisible] = useState(false);

  useEffect(() => {
    // Restore user's view state from localStorage
    const savedViewState = JSON.parse(localStorage.getItem("kanbanViewState"));
    if (savedViewState) {
      setGroupingOption(savedViewState.groupingOption);
      setSort(savedViewState.sort);
    }

    fetchData();
  }, [groupingOption, sort]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      console.log("Raw API response:", response);

      if (
        !response.data ||
        !response.data.tickets ||
        response.data.tickets.length === 0
      ) {
        console.error("API response is empty or does not contain ticket data.");
        return;
      }

      const ticketData = response.data.tickets;

      if (groupingOption !== "status" || sort !== "priority") {
        console.log("Grouping or sorting option changed. Updating data.");
        const processedTickets = processTickets(
          ticketData,
          groupingOption,
          sort
        );
        setTickets(processedTickets);
      } else {
        console.log(
          "Grouping and sorting options remain unchanged. Using cached data."
        );
      }

      localStorage.setItem(
        "kanbanViewState",
        JSON.stringify({ groupingOption, sort })
      );
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const processTickets = (data, groupingOption, sort) => {
    if (!Array.isArray(data)) {
      console.error("API response is not an array:", data);
      return [];
    }

    const priorityMap = {
      4: "Urgent",
      3: "High",
      2: "Medium",
      1: "Low",
      0: "No priority",
    };

    let processedData;

    switch (groupingOption) {
      case "status":
        processedData = groupBy(data, "status");
        break;
      case "user":
        processedData = groupBy(data, "userId");
        break;
      case "priority":
        processedData = groupBy(data, "priority");
        break;
      default:
        console.error("Invalid grouping option:", groupingOption);
        return [];
    }

    // Convert processedData into an object with arrays for each key
    const result = {};
    Object.keys(processedData).forEach((groupKey) => {
      result[groupKey] = orderBy(
        processedData[groupKey],
        [sort],
        sort === "priority" ? ["desc"] : ["asc"]
      );
    });

    const dataWithPriorityLabels = Object.keys(result).reduce(
      (flattenedResult, key) => {
        flattenedResult = flattenedResult.concat(
          result[key].map((ticket) => ({
            ...ticket,
            group: key,
            priorityLabel: priorityMap[ticket.priority],
          }))
        );
        return flattenedResult;
      },
      []
    );
    console.log(dataWithPriorityLabels);
    console.log('Processed Data:', result);
    console.log('Data with Priority Labels:', dataWithPriorityLabels);
    return result;
  };

  const handleGroupingOptionChange = (e) => {
    setGroupingOption(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleDisplayButtonClick = () => {
    setOptionsVisible(true);
    fetchData();
  };

  return (
    <div className="App">
      <div>
        <button className="App-button" onClick={handleDisplayButtonClick}>Display </button>
      </div>

      {optionsVisible && (
        <div className="App-button">
          <label >
            Grouping
            <select value={groupingOption} onChange={handleGroupingOptionChange}>
              <option value="status">Status</option>
              <option value="user">User</option>
              <option value="priority">Priority</option>
            </select>


          </label>
          <label>
            Ordering
            <select value={sort} onChange={handleSortChange}>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>
      )}

      <div className="kanban-board">
        {Object.keys(tickets).map((groupKey) => (
          <div key={groupKey} className="kanban-group">
            <h2>{groupKey}</h2>
            {tickets[groupKey].map((ticket) => (
              <div key={ticket.id} className="kanban-card">
                <div className="ticket-details">
                  <div className="ticket-id">
                    <strong>{ticket.id}</strong>{" "}
                  </div>
                  <div className="status">
                    {ticket.status === "Todo" && (
                      <>
                        <PanoramaFishEyeIcon
                          style={{ color: "grey", fontSize: "16px" }}
                        />
                      </>
                    )}
                    {ticket.status === "In progress" && (
                      <>
                        <TonalityIcon
                          style={{ color: "#FFC300 ", fontSize: "16px" }}
                        />
                      </>
                    )}
                    {ticket.status === "Done" && (
                      <>
                        < CheckCircleIcon
                          style={{ color: "purple", fontSize: "16px" }}
                        />
                      </>
                    )}
                    {ticket.status === "Backlog" && (
                      <>
                        <AddToQueueIcon
                          style={{ color: "lightblue", fontSize: "16px" }}
                        />
                      </>
                    )}
                    {ticket.status === "Cancel" && (
                      <>
                        <CancelIcon
                          style={{ color: "grey", fontSize: "16px" }}
                        />
                      </>
                    )}
                    {ticket.title}
                  </div>
                  <div className="priority">
                    {ticket.priority === 3 && (
                      <SignalCellularAltIcon style={{ color: "gray", fontSize: "16px" }} />
                    )}
                    {ticket.priority === 4 && (
                      <AnnouncementIcon
                        style={{ color: "orange", fontSize: "16px" }}
                      />
                    )}
                    {ticket.priority === 2 && (
                      <SignalCellularAlt2BarIcon style={{ color: "gray", fontSize: "16px" }} />
                    )}
                    {ticket.priority === 1 && (
                      <SignalCellularAlt1BarIcon style={{ color: "gray", fontSize: "16px" }} />
                    )}
                    {ticket.priority === 0 && <MoreHoriz style={{ color: "gray", fontSize: "16px" }} />}
                    {ticket.priorityLabel === undefined && (
                      <CircleIcon style={{ color: "gray", fontSize: "16px" }} />
                    )}
                    <div className="tags">{ticket.tag}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;