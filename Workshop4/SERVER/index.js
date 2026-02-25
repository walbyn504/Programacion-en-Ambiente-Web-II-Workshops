const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Course = require('./models/course');
const Professor = require('./models/professor');
const { authenticateToken, generateToken, registerUser } = require('./controllers/auth');

mongoose.connect('mongodb://localhost:27017/workshop4');
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
});

database.once('connected', () => {
    console.log('Base de datos conectada');
});

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// =====================
// RUTAS DE AUTENTICACIÓN
// =====================
app.post('/auth/token', generateToken);
app.post('/auth/register', registerUser);


//routes
app.post('/course', authenticateToken, async (req, res) => {
    try {

        const professorId = req.body.professorId;

        const professorExists = await Professor.findById(professorId);
        // Si no se encuntra (dato invalido)
        if (!professorExists) {
            return res.status(400).json({
                message: "Professor does not exist"
            });
        }
        // Se crea un objeto de curso
        const course = new Course({
            name: req.body.name,
            credits: req.body.credits,
            code: req.body.code,
            description: req.body.description,
            professorId: professorId
        });
        // Se guarda el curso
        const courseCreated = await course.save();
        // El curso creado se encuentra aca (url)
        res.header('Location', `/course?id=${courseCreated._id}`);

        res.status(201).json(courseCreated);

    } catch (error) {
        //sin permisos
        res.status(400).json({ message: error.message });
    }
});


app.get('/course', authenticateToken, async (req, res) => {
    try{
        // Si se pasa el id en el query devuelve solo un curso, en casoc ontrario devuelve todos.
        if(!req.query.id){
            //Buscamos el curso por id (incluyendo los datos del profesor)
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

app.put('/course/:id', authenticateToken, async (req, res) => {
    try {

        const id = req.params.id;
        // Se obtiene los datos del curso
        const updatedData = req.body;

        // Valida si están enviando professorId
        if (updatedData.professorId) {
            // Verifica que si hay un profesor con el id
            const professorExists = await Professor.findById(updatedData.professorId);
            // Si no existe lo muestra (dato invalido)
            if (!professorExists) {
                return res.status(400).json({
                    message: "Professor does not exist"
                });
            }
        }
        //Buscamos el id del curso y lo actualiza con los nuevos datos
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            updatedData,
            // Permite que MongoDB me muestre los nuevos datos 
            { new: true }
            // Obtenemos los datos completos del profesor
        ).populate('professorId');
 
        if (!updatedCourse) {
            return res.status(404).json({});
        }

        res.status(200).json(updatedCourse);

    } catch (error) {
        //Sin permisos
        res.status(400).json({});
    }
});

app.delete('/course/:id' , authenticateToken, async (req, res) => {
    try{
        //Se obtiene el id
        const id = req.params.id;
        
        const deletedCourse = await Course.findByIdAndDelete(id);
        // Si no existe el curso con ese id
        if(!deletedCourse){
            
            return res.status(404).json({});
        }

        res.status(200).json({});
    } catch(error){

        res.status(400).json({});
    }
})

// =====================
// RUTAS DE PROFESORES (PROTEGIDAS)
// =====================
app.post('/professor', authenticateToken, async (req, res) => {
    // Se crea un objeto
    const professor = new Professor({
        name: req.body.name,
        lastName: req.body.lastName,
        idCard: req.body.idCard,
        age: req.body.age
    })

    try {
        
        const professorCreated = await professor.save();
        // El curso creado se encuentra aca (url)
        res.header('Location', `/professor?id=${professorCreated._id}`);
        res.status(201).json(professorCreated)
    }
    catch (error) {
        // Si el dato enviado enviado es incorrecto o invalido.
        if (error.code === 11000) {
            return res.status(400).json({
                message: "ID Card already exists"
            });
        }
        // Si ocurre un error interno del servidor
        return res.status(500).json({});
    }
});

//Routes Professor
app.get('/professor', authenticateToken, async (req, res) => {
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

app.put('/professor/:id', authenticateToken, async (req, res) => {
    try{
        // Se obtiene el id del profesor y los datos
        const id = req.params.id;
        const updatedData = req.body;
        
        const options = { new: true };
        //Se busca si el profesor tiene un curso asigando
        const courses = await Course.find({professorId: id});
        if (courses.length > 0){
            return res.status(400).json({message: "Sin permiso de editar el profesor. Tiene un curso asigando"});
        }
        
        const updatedProfessor = await Professor.findByIdAndUpdate(
            id, updatedData, options
        );
        
        if(!updatedProfessor){
            return res.status(404).json({});
        }
        
        res.status(200).json(updatedProfessor);
    } catch(error){
        // Si el dato idCard esta duplicado 
        if (error.code === 11000) {
            return res.status(400).json({
                message: "ID Card already exists"
            });
        }
        //Error interno del servidor
        return res.status(500).json({});
    }
});

app.delete('/professor/:id' , authenticateToken, async (req, res) => {
    try{
        //Se obtiene el id del profesor
        const id = req.params.id;
        //Se busca si el profesor tiene un curso asigando
        const courses = await Course.find({professorId: id});
        if (courses.length > 0){
            return res.status(400).json({message: "Sin permiso de eliminar el profesor. Tiene un curso asigando"});
        }
        
        const deletedPorfessor = await Professor.findByIdAndDelete(id);
        
        if(!deletedPorfessor){
            return res.status(404).json({});
        }
        
        res.status(200).json({});
    } catch(error){
        //Sin permisos
        res.status(400).json({});
    }
})

// =====================
// INICIAR SERVIDOR
// =====================
app.listen(3001, () => console.log(`Servicio API UTN escuchando en el puerto 3001!`));