"use client";

import { Box, Stack, Typography, Button, TextField } from "@mui/material";
import { firestore } from "@/firebase"; // Ensure this correctly imports your Firestore instance
import {
  collection,
  query,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  gap: 3,
  display: "flex",
  flexDirection: "column",
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const backgroundStyle = {
    backgroundColor: "#e5e5f7",
    opacity: 0.7,
    backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, #e5e5f7 10px), repeating-linear-gradient(#b1bfac55, #b1bfac)`,
    height: "100vh", // Cover full viewport height
  };

  const updatePantry = async () => {
    const q = query(collection(firestore, "pantry"));
    const querySnapshot = await getDocs(q);
    const pantryList = [];

    querySnapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });

    setPantry(pantryList);
    console.log(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"),item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, { count: count + 1 });
    }
    else{
      await setDoc(docRef,{count : 1})
    }
          await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const{count} = docSnap.data()
      if(count === 1){
        await deleteDoc(docRef)
      }else{
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  };

  const handleVoiceCommand = (command) => {
    const words = command.toLowerCase().split(" ");
    if (words.includes("add")) {
      const item = words.slice(words.indexOf("add")).join(" ");
      addItem(item);
    } else if (words.includes("remove")) {
      const item = words.slice(words.indexOf("remove") + 1).join(" ");
      removeItem(item);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      handleVoiceCommand(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.stop();
    setIsListening(false);
  };

  return (
    <div style={backgroundStyle}>
      <Box
        marginLeft={"400px"}
        width="100vh"
        height="100vh"
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
        alignItems={"center"}
        gap={2}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Items
            </Typography>
            <Stack width="100%" direction={"row"} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" color="success" onClick={handleOpen}>
          Add Items
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </Button>

        <Box border={"3px solid #1e6091"}>
          <Box
            width="800px"
            height="100px"
            bgcolor={"#184e77"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Typography variant={"h2"} color={"#d9ed92"} textAlign={"center"}>
              Your Pantry
            </Typography>
          </Box>
          <Stack
            width="800px"
            height="300px"
            minHeight="150px"
            spacing={2}
            overflow={"auto"}
          >
            {pantry.map(({ name, count }) => (
              <Box
                key={name}
                width="100%"
                height="100px"
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                bgcolor={"#d9ed92"}
                paddingX={5}
              >
                <Typography
                  variant={"h3"}
                  color={"#184e77"}
                  textAlign={"center"}
                  fontWeight={"bold"}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                  variant={"h3"}
                  color={"#333"}
                  textAlign={"center"}
                >
                  Quantity: {count}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </div>
  );
}
