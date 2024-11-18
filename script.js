
//list of songs
let songs;


let currentfolder;


//Song-Slot to update
let currentsong = new Audio();

const playMusic = (track) => {
    // let audio=new Audio("/songs/"+track);
    currentsong.src = `/songs/${currentfolder}/` + track;
    currentsong.play();

    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}


async function getsongs(folder) {
    currentfolder = folder;

    try {
        // Fetch the list of songs in the folder
        let a = await fetch(`/songs/${folder}/`);
        if (!a.ok) throw new Error(`Failed to fetch songs for folder: ${folder}`);
        let response = await a.text();

        // Parse the response and extract song links
        let div = document.createElement("div");
        div.innerHTML = response;
        let s = div.getElementsByTagName("a");
        let songs = [];

        // Extract MP3 files
        for (let index = 1; index < s.length; index++) {
            const element = s[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/songs/${folder}/`)[1]);
            }
        }

        // Get the <ul> element for song list
        let songsUl = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
        songsUl.innerHTML = "";  // Clear existing list

        // Fetch the album info from info.json
        let info = await fetch(`songs/${folder}/info.json`);
        if (!info.ok) throw new Error(`Failed to fetch info.json for folder: ${folder}`);
        let jsondata = await info.json();

        // Add songs to the list dynamically
        for (const song of songs) {
            let songItem = document.createElement('li');
            songItem.innerHTML = `
                <img src="svg/music.svg" alt="Music icon">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>${jsondata.Name}</div>
                </div>
                <div class="playnow">
                    <span>playnow</span>
                    <img class="invert" src="svg/playbtn.svg" alt="Play button">
                </div>
            `;
            songsUl.appendChild(songItem);
        }

        // Attach event listeners to each song item for playback
        Array.from(songsUl.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
                console.log(`Playing song: ${songName}`);
                playMusic(songName);
                const playButton = document.querySelector("#play");
                if (playButton.src.includes("playbtn")) {
                    playButton.src = "svg/pause.svg";
                }
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        alert("Error loading songs. Please try again later.");
        return [];
    }
}

function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function DisplayAlbums() {
    try {
        // Fetch the albums directory
        let a = await fetch(`songs`);
        if (!a.ok) throw new Error("Failed to fetch albums");
        let response = await a.text();

        // Parse the response and extract album links
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardcontainer");

        // Process each album
        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

            if (e.href.includes("/songs")) {
                let folder = e.href.split("/").slice(-2)[0];

                // Fetch album info
                let info = await fetch(`songs/${folder}/info.json`);
                if (!info.ok) throw new Error(`Failed to fetch info.json for album ${folder}`);
                let albumInfo = await info.json();

                // Create album card
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <svg class="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                            <defs>
                                <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.5"/>
                                </filter>
                            </defs>
                            <circle cx="12" cy="12" r="10" fill="#3fd671" filter="url(#dropShadow)" />
                            <polygon points="10,8 16,12 10,16" fill="black"/>
                        </svg>
                        <img src="songs/${folder}/cover.jpeg" alt="Cover image" onerror="this.src='path/to/fallback-image.jpg'">
                        <h4>${albumInfo.Name}</h4>
                        <p>${albumInfo.Description}</p>
                    </div>
                `;
            }
        }

        // Load playlist when an album card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async (item) => {
                console.log("Album clicked:", item.currentTarget);
                let list = await getsongs(item.currentTarget.dataset.folder);
                console.log("Songs list:", list);
                playMusic(list[0]);  // Play the first song of the album
            });
        });
    } catch (error) {
        console.error("Error fetching albums:", error);
        alert("Error loading albums. Please try again later.");
    }
}







///
/////
///////
async function main() {

    //listing the songs
    await getsongs("Manam");
    console.log(songs);


    // Display all the Albums on the page 
    DisplayAlbums();






    // Attach EventListener to play,next,previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "svg/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "svg/playbtn.svg";
        }
    })



    // timeupdate event 
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime,currentsong.duration);


        //Auto-play song after completion of this play-time
        if(formatTime(currentsong.currentTime)==formatTime(currentsong.duration)){
            let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
            if(index==songs.length-1){
                playMusic(songs[0]);
            }
            else{
                playMusic(songs[index+1]);
            }
        }

        
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    }
    )


    // addEventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e,e.offsetX,e.target.getBoundingClientRect());
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentsong.currentTime = (percent) * currentsong.duration;
    })


    // addEventListener to hamburger svg
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelector(".left").style.width = "80vw";
    })


    // addEventListener to close svg
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-80vw"
    })



    // addEventListener to previous svg
    previous.addEventListener("click", () => {

        // console.log(currentsong);
        // console.log(currentsong.src.split("/")[-1][0]);

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
        else{
            playMusic(songs[songs.length-1])
        }
    })



    // addEventListener to next svg
    next.addEventListener("click", () => {

        // console.log(currentsong);
        // console.log(currentsong.src.split("/")[-1][0]);

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

        if(index == songs.length-1){
            playMusic(songs[0])
        }
        // if (index < songs.length)
        else {
            playMusic(songs[index + 1]);
        }
    })


    // addEventListener for volume
    range.addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value);
        // console.log(e.target.value);
        currentsong.volume = (e.target.value) / 100;
    })


    document.querySelector(".volume img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            // console.log(e.target.src)
            e.target.src= e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume=0
        }
        else{
            e.target.src= e.target.src.replace("mute.svg","volume.svg");
            currentsong.volume=.7;
        }
    })



    

}



main();

