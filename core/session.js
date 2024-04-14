const fs = require('fs');

const session = {};

const sessionProps = fs.readdirSync(`./core/session`).filter(f => f.endsWith(`.js`));

for(const prop of sessionProps) {
    console.log(`checking ${prop}`);
    Object.assign(session, {
        [prop.split(`.`).slice(0, -1).join(`.`)]: require(`./session/${prop}`)
    });
}

console.log(`session:`, session);

module.exports = session