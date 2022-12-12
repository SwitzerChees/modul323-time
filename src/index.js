import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";
import axios from "axios";

const { div, button } = hh(h);

const updateTimeMSG = (currentTime) => ({ type: MSGS.UPDATE_TIME.type, currentTime });

const MSGS = {
  LOAD_TIME: { type: "LOAD_TIME" },
  UPDATE_TIME: { type: "UPDATE_TIME" },
};

function view(dispatch, model) {
  const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
  return div({ className: "flex flex-col gap-4 items-center" }, [
    div({ className: "text-3xl" }, `${model.currentTime}`),
    div({ className: "flex gap-4" }, [button({ className: btnStyle, onclick: () => dispatch(MSGS.LOAD_TIME) }, "🕰 Current Time")]),
  ]);
}

function update(msg, model) {
  switch (msg.type) {
    case MSGS.LOAD_TIME.type:
      return {
        model,
        command: {
          url: "http://worldtimeapi.org/api/timezone/Europe/Zurich",
        },
      };
    case MSGS.UPDATE_TIME.type:
      const { currentTime } = msg;
      return { model: { ...model, currentTime: new Date(currentTime).toLocaleTimeString() } };
    default:
      return { model };
  }
}

// impure code below (not avoidable but controllable)
function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    // model = update(msg, model);
    const { model: updatedModel, command } = update(msg, model);
    model = updatedModel;
    if (command) {
      httpEffect(dispatch, command);
    }
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const httpEffect = (dispatch, command) => {
  const { url } = command;
  axios.get(url).then((response) => {
    dispatch(updateTimeMSG(response.data.datetime));
  });
};

const initModel = {
  currentTime: new Date().toLocaleTimeString(),
};

const rootNode = document.getElementById("app");
app(initModel, update, view, rootNode);
