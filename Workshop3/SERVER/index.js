const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Course = require('./models/course');
const Professor = require('./models/professor');

mongoose.connect('mongodb+srv://WalAdmin:Admin1234@workshop1.n48hs0t.mongodb.net/workshop2');
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
});

database.once('connected', () => {
    console.log('Database Connected');
});


const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cors({
  domains: '*',
  methods: '*'
}));


//routes
app.post('/course', async (req, res) => {
    try {

        const professorId = req.body.professorId;

        const professorExists = await Professor.findById(professorId);

        if (!professorExists) {
            return res.status(400).json({
                message: "Professor does not exist"
            });
        }

        const course = new Course({
            name: req.body.name,
            credits: req.body.credits,
            code: req.body.code,
            description: req.body.description,
            professorId: professorId
        });

        const courseCreated = await course.save();

        res.header('Location', `/course?id=${courseCreated._id}`);
        res.status(201).json(courseCreated);

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message: "ID Card already exists"
            });
        }
    }
});



app.get('/course', async (req, res) => {
    try{
        //if id is passed as query param, return single course else return all courses
        if(!req.query.id){
            const data = await Course.find().populate('professorId');;
            return res.status(200).json(data)
        }
        const data = await Course.findById(req.query.id).populate('professorId');;
        res.status(200).json(data)

        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

app.put('/course/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const updatedData = req.body;

        // Valida si están enviando professorId
        if (updatedData.professorId) {

            const professorExists = await Professor.findById(updatedData.professorId);

            if (!professorExists) {
                return res.status(400).json({
                    message: "Professor does not exist"
                });
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        ).populate('professorId');

        if (!updatedCourse) {
            return res.status(404).json({
                message: 'Course not found'
            });
        }

        res.status(200).json(updatedCourse);

    } catch (error) {
        
        if (error.code === 11000) {
            return res.status(400).json({
                message: "ID Card already exists"
            });
        }
    }
});


app.delete('/course/:id' , async (req, res) => {
    try{
        const id = req.params.id;
        const deletedCourse = await Course.findByIdAndDelete(id);

        if(!deletedCourse){
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch(error){
        res.status(400).json({ message: error.message });
    }
})

//Routes Professor
app.get('/professor', async (req, res) => {
    try{
        //Si no se agrega un id, muestra todos los profesores
        if(!req.query.id){
            const data = await Professor.find();
            return res.status(200).json(data)
        }
        // Si se agrega un id, muestra el profesor con el id correspondiente
        const data = await Professor.findById(req.query.id);
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

app.post('/professor', async (req, res) => {
    const course = new Professor({
        name: req.body.name,
        lastName: req.body.lastName,
        idCard: req.body.idCard,
        age: req.body.age
    })

    try {
        const professorCreated = await course.save();
        //add header location to the response
        res.header('Location', `/professor?id=${professorCreated._id}`);
        res.status(201).json(professorCreated)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
});

app.put('/professor/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const updatedProfessor = await Professor.findByIdAndUpdate(
            id, updatedData, options
        );

        if(!updatedProfessor){
            return res.status(404).json({});
        }

        res.status(200).json(updatedProfessor);
    } catch(error){
        res.status(400).json({});
    }
});

app.delete('/professor/:id' , async (req, res) => {
    try{
        const id = req.params.id;
        const deletedPorfessor = await Professor.findByIdAndDelete(id);

        if(!deletedPorfessor){
            return res.status(404).json({});
        }

        res.status(200).json({});
    } catch(error){
        res.status(400).json({});
    }
})

//start the app
app.listen(3001, () => console.log(`UTN API service listening on port 3001!`))