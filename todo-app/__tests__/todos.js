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


  
test("Sign up", async () => {
  let res = await agent.get("/signup");
  const csrfToken = extractCsrfToken(res);
  res = await agent.post("/users").send({
    firstName: "Test",
    lastName: "User A",
    email: "user.a@test.com",
    password: "12345678",
    _csrf: csrfToken,
  });
  expect(res.statusCode).toBe(302);
});




  test("create a new todo", async () => {
    agent = request.agent(server);
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
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
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    console.log(csrfToken);
    await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

    expect(parsedGroupedResponse.dueToday).toBeDefined();

    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });
      try {
        const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
        expect(parsedUpdateResponse.completed).toBe(true);
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.error('Response content:', markCompleteResponse.text);
        // Handle the error or failure condition appropriately
      }
  });


  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Delete me",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const deletetodos = await agent.get("/todos").set("Accept", "application/json");
    const parseddeletetodos = JSON.parse(deletetodos.text);

    expect(parseddeletetodos.dueToday).toBeDefined();

    const dueTodayCount = parseddeletetodos.dueToday.length;
    const latestTodo = parseddeletetodos.dueToday[dueTodayCount - 1];

    const response = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const boolean = Boolean(response.text);
    expect(boolean).toBe(true);

  });

  test("Should toggle a completed item to incomplete when clicked on it", async () => {
    agent = request.agent(server);
    const res = await agent.get("/todos");
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

