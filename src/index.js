const chalk = require('chalk');
const server = require('./app');

const port = process.env.PORT;
server.listen(port, () => {
  console.log(chalk.green.inverse(`\n***** Server is listen on port ${port} *****\n`));
});
