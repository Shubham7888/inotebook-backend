const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator')

// Route1: Get all the notes using GET "/api/notes/getuser". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route2: Add new notes using post "/api/notes/addnote". Login required 
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be of atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    try {

        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// Route 3: update an existing note using put "/api/notes/updatenote". login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const {title, description, tag} = req.body;
  try{
  const newNote = {};
  if(title){
    newNote.title=title;
  }
  if(description){
    newNote.description=description;
  }
  if(tag){
    newNote.tag=tag;
  }

  let note = await Note.findById(req.params.id); 
  if(!note){
    return res.status(404).send("Not Found");
  }
  if(note.user.toString()!== req.user.id){
    return res.status(420).send("Not Allowed");
  }

  note=await Note.findByIdAndUpdate(req.params.id,{$set: newNote},{new:true})
  res.json({note});
}catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}

})
   

// Route 4: delete an existing note using delete "/api/notes/deletenote". login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
 
   try{
    let note = await Note.findById(req.params.id); 
    if(!note){
      return res.status(404).send("Not Found");
    }
    if(note.user.toString()!== req.user.id){
      return res.status(420).send("Not Allowed");
    }
  
    note=await Note.findByIdAndDelete(req.params.id);
    res.json({"Success": "Note has been deleted",note:note});
  }
   catch(error){
    console.error(error.message);
        res.status(500).send("Internal Server Error");
   }

  
  })


module.exports = router;