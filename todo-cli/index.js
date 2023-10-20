// index.js
const { connect } = require("./connectDB.js");
const Todo = require("./TodoModel.js");

// eslint-disable-next-line no-unused-vars
const createTodo = async () => {
  try {
    await connect();
    const todo = await Todo.addTask({
      title: "Second Item",
      dueDate: new Date(),
      completed: false,
    });
    console.log(`Created todo with ID : ${todo.id}`);
  } catch (error) {
    console.error(error);
  }
};

// eslint-disable-next-line no-unused-vars
const countItems = async () => {
    try {
      const totalCount = await Todo.count();
      console.log(`Found ${totalCount} items in the table!`);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllTodos = async () => {
    try {
      const todos = await Todo.findAll();
      const todoList = todos.map((todo) => todo.displayableString()).join("\n");
      console.log(todoList);
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getSingleTodo = async () => {
    try {
      const todo = await Todo.findOne({
        where: {
          completed: false,
        },
        order: [["id", "DESC"]],
      });
  
      console.log(todo.displayableString());
    } catch (error) {
      console.error(error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  const updateItem = async (id) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const todo = await Todo.update(
        { completed: true },
        {
          where: {
            id: id,
          },
        }
      );
  
    } catch (error) {
      console.error(error);
    }
  };
  
  // eslint-disable-next-line no-unused-vars
  const deleteItem = async (id) => {
    try {
      const deletedRowCount = await Todo.destroy({
        where: {
          id: id,
        },
      });
  
      console.log(`Deleted ${deletedRowCount} rows!`);
    } catch (error) {
      console.error(error);
    }
  };

(async () =>{
  await createTodo();
  await countItems();
  await getAllTodos();
  await deleteItem()
  })();

//  (async () => {
//     // await createTodo();
//     // await countItems();
//     await getAllTodos();
//     // await updateItem(2);
//     await deleteItem(3);

//     await getAllTodos();
//   })();