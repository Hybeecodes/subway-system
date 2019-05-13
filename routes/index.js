var express = require('express');
var router = express.Router();
const Passenger = require('../models/passenger');

const stations = [
  { name: '5th', zones: [1]},
  { name: 'Pelham	Parkway', zones: [1,2]},
  { name: 'Bronx', zones: [3]},
  { name: 'Guns	Hill', zones: [2]}
]; // assume the indecies are the IDs 


router.post('/seed', async (req,res) => {
  try {
    const passenger = new Passenger({ number: 36458646679 }); // you can change number
    await passenger.save();
    return res.status(201).send(passenger);
  } catch (e) {
    return res.status(500).send({error:'Internal Server error !'});
  }
  
});


router.post('/auth', async(req, res) => {
  try {
    // console.log(req.body);
    const { number } = req.body;
    if(!number){
      return res.status(400).send({error:'Number is required !'});
    }
    // check for number in DB
    const passenger = await Passenger.findOne({number});
    if(passenger){
      req.session.passenger = passenger;
      console.log(req.session)
      return res.status(200).send({message:passenger});
    }else{
      return res.status(400).send({error:'Invalid Number !'});
    }
  } catch (e) {
    return res.status(500).send({error:'Internal Server error !'});
  }
  
});

router.use((req, res, next) => {
  // middleware to ensure authentication
  if(!req.session.passenger){
    return res.status(403).send("Not Authorized!");
  }
  next();
});

router.get('/charge/:type', async(req, res) => {
  try {
    const { type } = req.params;
    let charge = 0;
    let passenger = await Passenger.findById(req.session.passenger._id);
    if(type){
      console.log('type', typeof type)
      switch (type) {
        case '1':
          // charge passenger the max fare
          console.log(charge);
          charge = 3.20;
          break;

        case '2':
          // charge passenger the bus fare
          charge = 1.80;
          console.log(charge);
          break;
      
        default:
          break;
      }
      
      // charge passenger
      passenger.balance -= charge;
      await passenger.save();
      // update session
      req.session.passenger = passenger;
      return res.status(200).send(passenger);
    }else{
      return res.status(400).send({error:'Type is required !'});
    }
  } catch (e) {
    return res.status(500).send({error:'Internal Server error !'});
  }
  
})

router.post('/swipe-out', async (req, res) => {
  try {
    let cost = 3.20;
    let passenger = await Passenger.findById(req.session.passenger._id);
    const { stationId, journeyType } = req.query; // journeyType can be 1 for subway or 2 for bus
    switch (journeyType) {
      case '2':
        cost = 1.80; // All bus journeys are charged at the same price.
        res.status(200).send(passenger);
        break;
      case '1':
        const station = stations[stationId];
        const zones = station['zones'];
        // check for fare conditions
        if(zones.length === 1 && zones[0] === 1){ // Anywhere	in	Zone	1
          console.log('1')
          cost = 2.50;
        }
        else if(zones.length === 1 && zones[0] !== 1){ // Any	one	zone	outside	zone	1
          console.log('2')
          cost = 2.00;
        }
        else if(zones.length === 2 && zones.includes(1)){
          console.log('3')
          cost = 3.00;
        }
        else if(zones.length === 2 && !zones.includes(1)){
          console.log('4')
          cost = 2.25;
        }
        else if(zones.length === 3){
          console.log('5')
          cost = 3.20;
        }
        // refund max fare and remove new cost
        passenger.balance += 3.20; //refund max fare
        passenger.balance -= cost;
        await passenger.save();
        res.status(200).send(passenger);
        break;
      default:
        res.status(200).send(passenger);
        break;
    }
  } catch (e) {
    return res.status(500).send({error:'Internal Server error !'});
  }
});

router.get('/balance', async (req,res) => {
  try {
    let passenger = await Passenger.findById(req.session.passenger._id);
    if(!passenger){
      return res.status(400).send('User Not Found');
    }
    res.status(200).send({balance: passenger.balance});
  } catch (e) {
    return res.status(500).send({error:'Internal Server error !'});
  }
});

module.exports = router;
