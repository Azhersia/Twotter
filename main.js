import './style.css'
import { supabase } from './Supabase.js'


// Auth

// Listen to auth events
supabase.auth.onAuthStateChange((event, session) => {
  const loginEl = document.querySelector("#login")
  const logoutEl = document.querySelector('#logout')
  const newTwootEl = document.querySelector('#newTwoot')

  if (event == 'SIGNED_IN') {
    // Hide login
    loginEl.classList.add("hidden")

    // Show logout
    document.querySelector('#logout > h2').innerText = session.user.email
    logoutEl.classList.remove('hidden')

    //show new tweet input
    newTwootEl.classList.remove('hidden')
  }

  if (event === 'SIGNED_OUT') {
    //show login
    loginEl.classList.remove('hidden')

    //hide on logout
    logoutEl.classList.add('hidden')
    // hide new tweet input
    newTwootEl.classList.add('hidden')
  }
})

// Sign in/up
const form = document.querySelector("form")

form.addEventListener("submit", async function (event) {
  const email = form[0].value
  const password = form[1].value

  // stops page refresh
  event.preventDefault()

  // Login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If login error
  if (signInError) {
    // If no account, sign up  
    if (signInError.message === "Invalid login credentials") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      // create user in database
      if (signUpData.user.id) {
        const { error } = await supabase
          .from('Users')
          .insert({ username: signUpData.user.email })

        if (error) console.log(error)
      }

      // If user already registered
      if (signUpError.message === "User already registered") {
        alert(signInError.message)
      } else {
        alert(signUpError.message)
      }
    }
  }
})

// sign out
const signOutButton = document.querySelector('#logout > button')

signOutButton.addEventListener('click', async function () {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  }
})

// Twoots

// Listen for changes to database table
supabase
  .channel('public:Twoots')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Twoots' }, newTwoot)
  .subscribe()

let newTwootCount = 0

function newTwoot(e) {
  newTwootCount++

  const newTwootsEl = document.querySelector('#moreTweets')

  newTwootsEl.innerText = `Show ${newTwootCount} Tweets`
  newTwootsEl.classList.remove('hidden')
}

const newTwootsEl = document.querySelector('#moreTweets').addEventListener('click', function () {
  document.querySelector('#moreTweets').classList.add('hidden')
  document.querySelector('ul').replaceChildren()
  newTwootCount = 0
  getTwoots()
})

async function getTwoots() {
  // get data from database
  const { data, error } = await supabase
    .from('Twoots')
    .select(`
    id, 
    message,
    created_at,
    Users (
      username
    )
    `).order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  }

  console.log(data)

  const listEl = document.querySelector('ul')

  const { data: user } = await supabase.auth.getSession()

  console.log(user)

  // loop through twoots
  for (const i of data) {
    const itemEl = document.createElement('li')
    itemEl.classList.add('flex', 'gap-4', 'border-b', 'pb-6')
    itemEl.innerHTML = `
        <div class="w-14 h-14 rounded-full">
          <img src="logo.png" alt="">
        </div>
        <div>
          <div class="flex gap-2 text-gray-500">
            <span class="font-semibold text-black">${i.Users.username}</span>
            <span>${new Date(i.created_at).toLocaleString()}</span>
            <i class="ph-trash text-xl text-blue-500 cursor-pointer ${i.Users.username == user.session?.user.email ? '' : 'hidden'}"></i>
          </div>
          <p>${i.message}</p>
        </div>
`

    // delete twoot
    itemEl.addEventListener("click", async function () {
      const { error } = await supabase
        .from('Twoots')
        .delete()
        .eq('id', i.id)

      // delete elements
      itemEl.remove()

      if (error) console.log(error)
    })

    listEl.appendChild(itemEl)
  }
}


getTwoots()

// new tweet
document.querySelector("#twoot").addEventListener("click", async function () {
  let text = document.querySelector("textarea")

  const { data, error } = await supabase.auth.getSession()

  if (error) console.log(error)

  if (data.session.user.id) {
    const { error } = await supabase
      .from('Twoots')
      .insert({ message: text.value, user_id: data.session.user.id })
    if (error) console.log(error)

    // clear input
    text.value = " "
  }
})