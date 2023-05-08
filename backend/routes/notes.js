const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');




// Route 1: Get All the Notes using: GET "/api/auth/fetchallnotes" . - login required

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    console.log("hello")
    try {
        const notes = await Note.find({ });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})


// Route 2: Add a new Note using: POST "/api/auth/fetchallnotes" . - login required

router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be 5 char').isLength({ min: 5 }),], async (req, res) => {
        try {

            const { title, description, tag } = req.body;

            // If there is error return bad request.
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()

            res.json(savedNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    })

// Route 3: Update a existing Note using: PUT "/api/auth/updatenote" . - login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // Create a newNote Object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
            console.log(req.user.id, 66)
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        const notes = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })

        // note.save();
        res.json({ notes });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// Route 4: Delete a existing Note using: DELETE "/api/auth/deletenote" . - login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {

        //Find the note to be deleted and delete it
        // let note = await Note.findById(req.params.id);
        

       const note = await Note.findByIdAndDelete(req.params.id)

        if (!note) { return res.status(404).send("Not Found") }

        // Allow deletion only if user owns this Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        // note.save();

        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router