if(process.env.NODE_ENV !="production")
{
  require('dotenv').config();
}


const express=require("express");
const mongoose=require("mongoose");
const app=express();
const Listing = require('./models/listing.js');
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review = require('./models/review.js');
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
// const Mongo_URL="mongodb://127.0.0.1:2701/traveoo";

const dbUrl = process.env.ATLASDB_URL;
if (!dbUrl) {
    throw new Error("ATLASDB_URL is undefined. Check your .env file.");
}

main()
    .then(() => {
        console.log("Database connected!");
    })
    .catch((err) => console.error("Database connection error:", err));

async function main() {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:"mysupersecretcode"
    
  },
 touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err)});
const sessionOptions={
  store,
  secret:"MySupersecretcode",
  resave:false,
  saveUninitalized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
};
// root connection
// app.get("/",(req,res)=>{
//   res.send("connection successful");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"abc@gmail.com",
//     username:"abc",
//   });
//  let registeredUser=await User.register(fakeUser,"world");
//  res.send(registeredUser);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
//testing database is connected ?
// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"our home",
//         description:" under the cliff",
//         prize:2500,
//         location:"varkala,kerala",
//         country:"India",
//     });
//       await sampleListing.save();
//       console.log("sample saved");
//       res.send("successful testing");


// });



app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"page not found"));
});
app.use((err,req,res,next)=>{
  let{ statusCode=500,message="something went wrong"}=err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{message});
 
});


app.listen(8080,()=>{
    console.log("app is listening to port 8080");
});