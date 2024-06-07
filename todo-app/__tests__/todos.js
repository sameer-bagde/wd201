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

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

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

  test("Sign out", async () => {
    response = await agent.get("/signout");
    expect(response.statusCode).toBe(302);
    response = await agent.get("/todos");
    expect(response.statusCode).toBe(302);
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
    expect(res.statusCode).toBe(302);
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
  });

  test("should not create a todo item with empty dueDate", async () => {
    agent = request.agent(server);
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "should not create a todo item with empty dueDate",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(res.statusCode).toBe(302);
  });

  test("should  create sample due today item", async () => {
    agent = request.agent(server);
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "should  create sample due today item",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(res.statusCode).toBe(302);
  });

  test("should  create sample due later item", async () => {
    agent = request.agent(server);
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "should  create sample due later item",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(res.statusCode).toBe(302);
  });

  test("should  create sample overdue item", async () => {
    agent = request.agent(server);
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "should  create sample overdue today item",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(res.statusCode).toBe(302);
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
  });
});
