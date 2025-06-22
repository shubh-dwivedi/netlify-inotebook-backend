const express = require('express');
const router = express.Router()
const fetchuser  = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");


// ROUTE 1: Fetch all notes of a user using: GET "/api/notes/fetchallnotes" . Login required
router.get('/fetchallnotes', fetchuser, async (event, res)=> {
    try {
        // const req = JSON.parse(event.body);
        const user_id = event.user.id;
        const notes = await Note.find({user: user_id});
        res.json(notes);    
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    
})

// ROUTE 2: Add a new Note using: POST "/api/notes/addnote" . Login required
router.post('/addnote', fetchuser, [
    body("title", "Please add a title of min 3 characters").isLength({ min: 3 }),
    body("description", "Please enter min 5 characters in description").isLength({ min: 5 })
], async (event, res)=> {
    // If there are errors, return bad request and errors
    const req = JSON.parse(event.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        // const {title, description, tag} = req.body;
        const {title, description, tag} = req;
        const user_id = event.user.id;
        const note = new Note({
            title, description, tag, user: user_id
        })
        const savedNote = await note.save()
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote" . Login required
router.put('/updatenote/:id', fetchuser, [
    body("title", "Please add a title of min 3 characters").isLength({ min: 3 }),
    body("description", "Please enter min 5 characters in description").isLength({ min: 5 })
], async (event, res)=> {
    const req = JSON.parse(event.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {title, description, tag} = req;
        const user_id = event.user.id;
        const note_id = event.params.id;
        const newNote = {}
        if(title) {newNote.title = title;}
        if(description) {newNote.description = description;}
        if(tag) {newNote.tag = tag;}

        //Find the note to be updated and update it
        let note = await Note.findById(note_id);
        if(!note) {
            return res.status(404).send("Not found");
        }
        //check if user owns the note they are trying to update
        if(note.user.toString() !== user_id) {
            return res.status(401).send("Not allowed")
        }
        note = await Note.findByIdAndUpdate(note_id, {$set: newNote}, {new: true});
        res.json({note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (event, res)=> {
    try {
        //Find the note to be deleted and delete it
        const user_id = event.user.id;
        const note_id = event.params.id;
        let note = await Note.findById(note_id);
        if(!note) {
            return res.status(404).send("Not found");
        }

        //check if user owns the note they are trying to delete
        if(note.user.toString() !== user_id) {
            return res.status(401).send("Not allowed")
        }

        note = await Note.findByIdAndDelete(note_id);
        res.json({"Success":"Note has been deleted",note: note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 5: Test API status
router.post('/notestest', fetchuser, async (event, res)=> {
    try {
        console.log(event.user.id)
        console.log(JSON.parse(event.body))
        console.log("Notes API is working")
        res.json({message: 'Notes API is working'});    
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router