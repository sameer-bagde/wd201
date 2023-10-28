/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
const todoList = () => {
  all = [];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    const today = new Date().toLocaleDateString("en-CA");
    return all.filter((item) => item.dueDate < today);
  };

  const dueToday = () => {
    const today = new Date().toLocaleDateString("en-CA");
    return all.filter((item) => item.dueDate === today);
  };

  const dueLater = () => {
    const today = new Date().toLocaleDateString("en-CA");
    return all.filter((item) => item.dueDate > today);
  };

  const toDisplayableList = (list) => {
    return list
      .map(
        (todo) =>
          `${todo.completed ? "[x]" : "[ ]"} ${todo.title} ${
            todo.dueDate == today ? "" : todo.dueDate
          }`
      )
      .join("\n");
  };
  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};
module.exports = todoList;
