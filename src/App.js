import './App.css';
import React, { useState, useEffect, useRef } from "react"

function App() {
  // const conn = "https://appointment-booking-server.herokuapp.com"
  const conn = "http://192.168.1.9:5000"

  // const USER = "61d0b3ed05ec9e8c589dd20e"; // Wasim
  const USER = "61d1daa74d99c961936ffc6e"; // Burgos
  // const USER = "61d1db344d99c961936ffc70"; // Awatif
  // const USER = "61d1db734d99c961936ffc72"; // Miguel
  // const USER = "61d1dc4d4d99c961936ffc73"; // Niyamath
  // const USER = "61d1dc8f4d99c961936ffc74"; // Nasr

  const [user, setUser] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availabilityState, setAvailabilityState] = useState(false);
  const [view, setView] = useState("appointment");
  const [edit, setEdit] = useState(false);
  const [timings, setTimings] = useState([]);
  // const timings = useRef([])

  useEffect(() => {
    handleLoad()
  }, []);

  useEffect(() => {
    if(timings){
      console.log("TIMING SET")
    }
  }, [timings]);

  useEffect(() => {
    if(user && buyers){
      handleAppointments()
      handleRequests()
    }
  }, [user, buyers]);

  const handleLoad= async () => {
    // console.log("handleLoad-----------")
    fetchUser(USER);
    fetchBuyers();
    handleAppointments()
    handleRequests()
  }

  const fetchUser = async (userId) => {
    // console.log("fetchUser - START")
    try {
      let url = `${conn}/seller/findOne/${userId}`
      const response = await fetch(url, {
        method: "GET",
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        // body: JSON.stringify(data)
      })
      let res = await response.json()
      // console.log("USERR - ",res)
      setUser(res)
      setTimings(res.availability)
    } catch (err) {
      console.log("FetchUser Errror ",err.message)
    }
    // console.log("fetchUser - End")
  }

  const fetchBuyers = async () => {
    try {
      let url = `${conn}/buyer/findAll`
      const response = await fetch(url, {
        method: "GET",
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        // body: JSON.stringify(data)
      })
      let res = await response.json()
      // console.log("BUYERSS - ",res)
      setBuyers(res)
    } catch (err) {
      console.log("fetchBuyers Errror ",err.message)
    }
  }

  const handleRequests = () => {
    const tempRequests = [];
    user?.requests?.filter(x => x.status === "PENDING").forEach(element => {
      tempRequests.push({
        buyer : buyers?.filter(x => x._id === element.buyerId)[0],
        request: element
      })
    });
    // console.log("TEMP REQP " , tempRequests)
    setRequests(tempRequests)
  }

  const handleAppointments = () => {
    const tempAppointments = [];
    user?.appointments?.filter(x => x.status === "ACCEPTED").forEach(element => {
      tempAppointments.push({
        buyer : buyers?.filter(x => x._id === element.buyerId)[0],
        appointment: element
      })
    });
    // console.log("TEMPAP " , tempAppointments)
    setAppointments(tempAppointments)
  }

  const handleView = (view) => {
    handleLoad()
    setView(view)
  }

  const handleEdit = () => {
    setEdit(!edit)
    timings.current = [];
    setAvailabilityState(!availabilityState)
  }

  const handleSave = () => {
    console.log("-------",timings.current)
  }

  const handleTiming = (item) => {
    let tempArray = timings
    // let tempArray2 = timings.current;
    let tempItem = item;
    // if(timings?.includes(item)){
    //   tempArray = timings?.filter(x => x.time !== item.time)
    // }
    // else {
    //   if(item.status === true){
    //     tempItem.status = false;
    //   } else {
    //     tempItem.status = true;
    //   }
    //   tempArray.push(tempItem)
    // }
    // timings.current = tempArray
    // setAvailabilityState(!availabilityState)
    // console.log("ARRRRR -- ",timings.current)

    if(item.status === true){
      tempItem.status = false;
    } else {
      tempItem.status = true;
    }

    const index = tempArray.indexOf(item)

    if(index !== -1){
      tempArray[index] = tempItem;
    }
    setTimings(tempArray)
    // console.log("ARRR", tempArray)
    console.log("ARRR", timings)
  }

  const acceptRequest = async (item) => {
    const data = {
      appointmentId: item._id,
      sellerId: item.sellerId,
      buyerId: item.buyerId,
      date: item.date,
      time: item.time,
      status: item.status
    }
    try {
      let url = `${conn}/seller/acceptRequest`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      let res = await response.json()
      if(res.message === "Success"){
        handleLoad()
      }
    } catch (err) {
      console.log("FetchUser Errror ",err.message)
    }
  }

  const rejectRequest = async (item) => {
    const data = {
      appointmentId: item._id,
      sellerId: item.sellerId,
      buyerId: item.buyerId,
      date: item.date,
      time: item.time,
      status: item.status
    }
    try {
      let url = `${conn}/seller/rejectRequest`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      let res = await response.json()
      if(res.message === "Success"){
        handleLoad()
      }
    } catch (err) {
      console.log("FetchUser Errror ",err.message)
    }
  }

  return (
    <div className="App">
      <div className="leftSide">
        <div className='leftTop'>
          <p className='helloText'>Hello, {user?.fullName}</p>
          <p className='notificationText'>You have {requests?.length} pending requests</p>
        </div>
        <div className='leftBottom'>
          <div className='container'>
            <div className='containerTop'>
              <button className={view === "request" ?'headerButton':"activeHeaderButton"} onClick={()=>handleView("appointment")}>Upcoming Appointments</button>
              <button className={view === "appointment" ?'headerButton':"activeHeaderButton"} onClick={()=>handleView("request")}>Requests</button>
            </div>
            <div className='containerBottom'>
              {view === "appointment" && appointments?.length > 0 && appointments.map( (item, index) =>
                <div key={index} className='appointmentItem'>
                  <div className='imageDiv'>
                    <img src={item.buyer?.photoURL} className="image" alt="image" />
                  </div>
                  <div className='name'>
                    {item.buyer?.fullName}
                  </div>
                  <div className='date'>
                    {item.appointment?.date}
                  </div>
                  <div className='time'>
                    {item.appointment?.time}
                  </div>
                  <div className='status'>
                    {item.appointment.status}
                  </div>
                </div>
              )}

              {view === "request" && requests?.length > 0 && requests.map( (item, index) =>
                <div key={index} className='appointmentItem'>
                  <div className='imageDiv'>
                    <img src={item.buyer?.photoURL} className="image" />
                  </div>
                  <div className='name'>
                    {item.buyer?.fullName}
                  </div>
                  <div className='date'>
                    {item.request?.date}
                  </div>
                  <div className='time'>
                    {item.request?.time}
                  </div>
                  <div className='actions'>
                    <button className='reject' onClick={()=>rejectRequest(item.request)}>
                      <i className="material-icons">close</i>
                    </button>
                    <button className='accept'  onClick={()=>acceptRequest(item.request)}>
                    <i className="material-icons">check</i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="rightSide">
        <div className='rightTop'>
          <img src={user?.photoURL} className="userImage" />
          <p className='userName'>{user?.fullName}</p>
          <p className='userCompany'>{user?.company}</p>
        </div>
        <div className='rightBottom'>
          <div className='rightContainerHeader'>
            My Availability
            <button className='edit'  onClick={()=>handleEdit()}>
              <i className="material-icons">{edit ? "close":"edit"}</i>
            </button>
          </div>
          <div className='rightContainerBody'>
            {timings?.filter(x=> x.status === true || x.status === !edit).map((item, index) =>
              <button key={index} className={item.status === true ?'activeTimeButton' :'timeButton'}  disabled={!edit} onClick={()=>handleTiming(item)}>
                {item.status + ""}
              </button>
            )}
          </div>
          <div className='rightContainerFooter'>
            {edit && 
              <button className='saveButton'  onClick={()=>handleSave()}>
                Save Changes
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
