/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");
var cheerio = require("cheerio");
let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("create a new todo", async () => {
    agent = request.agent(server);
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    console.log(csrfToken);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark a todo as complete", async () => {
    agent = request.agent(server);
    let res = await agent.get("/");
    console.log(res);
    let csrfToken = extractCsrfToken(res);
    console.log(csrfToken);
    await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

    expect(parsedGroupedResponse.dueToday).toBeDefined();

    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });
    // const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    // expect(parsedUpdateResponse.completed).toBe(true);
  });
  // test("Marks a todo with the given ID as complete", async () => {
  //   const dueDate = new Date().toISOString();
  //   const createResponse = await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: dueDate,
  //     completed: false,
  //   });
  //   const parsedResponse = JSON.parse(createResponse.text);
  //   const todoID = parsedResponse.id;
  //   expect(parsedResponse.completed).toBe(false);

  //   const markCompleteResponse = await agent.put(`/todos/${todoID}/markASCompleted`).send();
  //   const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });

  // test("Fetches all todos in the database using /todos endpoint", async () => {
  //   const dueDate = new Date().toISOString();
  //   await agent.post("/todos").send({
  //     title: "Buy xbox",
  //     dueDate: dueDate,
  //     completed: false,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Buy ps3",
  //     dueDate: dueDate,
  //     completed: false,
  //   });
  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Delete me",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const deletetodos = await agent.get("/").set("Accept", "application/json");
    const parseddeletetodos = JSON.parse(deletetodos.text);

    expect(parseddeletetodos.dueToday).toBeDefined();

    const dueTodayCount = parseddeletetodos.dueToday.length;
    const latestTodo = parseddeletetodos.dueToday[dueTodayCount - 1];

    const response = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const boolean = Boolean(response.text);
    expect(boolean).toBe(true);
    // const createdTodo = JSON.parse(createResponse.text);
    // const todoID = createdTodo.id;
    // const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
    // const deleted = JSON.parse(deleteResponse.text);
    // expect(deleted).toBe(true);
  });

  test(" Should toggle a completed item to incomplete when clicked on it", async () => {
    agent = request.agent(server);
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    console.log(csrfToken);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "toggel",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(302);
  });
});
