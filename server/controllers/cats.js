import { Cat } from "../models/cat";

module.exports = {
  create(req, res) {
    return Cat.create({
      name: req.params.name,
    })
      .then((cat) => res.status(201).send(cat))
      .catch((error) => res.status(400).send(error));
  },
  //   list(req, res) {
  //     // return Groups.findAll({
  //     //   include: [{ model: Expenses, as: "expenseItems" }],
  //     //   include: [{ model: Users, as: "users" }],
  //     // })
  //     return Group.find()
  //       .then((groups) => res.status(200).send(groups))
  //       .catch((error) => res.status(400).send(error));
  //   },
};
