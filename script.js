let selectedRentIndex = null;
let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
// ===== Navigation =====
function goRegister() {
  window.location.href = "register.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// ===== Registration =====
function register() {

  let user = document.getElementById("newUser").value.trim();
  let pass = document.getElementById("newPass").value.trim();
  let role = localStorage.getItem("role");

  // REQUIRED FIELDS
  if (!user || !pass) {
    document.getElementById("regMsg").innerText =
      "Please enter username and password!";
    return;
  }

  // ✅ PASSWORD MIN LENGTH VALIDATION
  if (pass.length < 6) {
    document.getElementById("regMsg").innerText =
      "Password must be at least 6 characters long";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Prevent duplicate username
  let exists = users.find(u => u.user === user);
  if (exists) {
    document.getElementById("regMsg").innerText =
      "Username already exists!";
    return;
  }

  let newUser = {
    user,
    pass,
    role,
    joined: new Date().toLocaleDateString()
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  localStorage.setItem("currentUser", user);

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  profiles[user] = { completed: false };
  localStorage.setItem("profiles", JSON.stringify(profiles));

  window.location.href = "profile.html";
}


// ===== Login =====
function login() {
  let user = document.getElementById("username").value.trim();
  let pass = document.getElementById("password").value.trim();
  let role = localStorage.getItem("role");

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};

  let found = users.find(
    u => u.user === user && u.pass === pass && u.role === role
  );

  if (!found) {
    document.getElementById("msg").innerText =
      "Invalid credentials for selected role";
    return;
  }

  localStorage.setItem("currentUser", user);
  
  if (role === "customer") window.location.href = "customer.html";
  else window.location.href = "owner.html";


}





// ===== Owner Functions =====
function toggleAddForm() {
  let form = document.getElementById("addForm");
  let itemsBox = document.getElementById("myItems");
  if (!form) return;

  form.style.display = form.style.display === "none" ? "block" : "none";
  if (itemsBox) itemsBox.style.display = "none"; // hide My Items
}

function addItem() {

  let items = JSON.parse(localStorage.getItem("items")) || [];
  let currentUser = localStorage.getItem("currentUser");

  let name = document.getElementById("name").value.trim();
  let price = Number(document.getElementById("price").value.trim());
  let deposit = document.getElementById("deposit").value.trim();
  let brand = document.getElementById("brand").value.trim();
  let features = document.getElementById("features").value.trim();
  let quantity = parseInt(document.getElementById("quantity").value.trim()) || 1;

  let imageFile = document.getElementById("image").files[0];

  if (!name || !price) {
    alert("Please enter at least name and price!");
    return;
  }

  if (!imageFile) {
    alert("Please select item image");
    return;
  }

  let reader = new FileReader();

  reader.onload = function(e) {

    let item = {
      name,
      price,
      deposit,
      brand,
      features,
      owner: currentUser,
      quantity,
      image: e.target.result   // ⭐ store base64
    };

    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));

    alert("Item Added!");
    showMyItems();
  };

  reader.readAsDataURL(imageFile);
}


function showMyItems() {
  let items = JSON.parse(localStorage.getItem("items")) || [];
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  let currentUser = localStorage.getItem("currentUser");
  let box = document.getElementById("myItems");
  let form = document.getElementById("addForm");
  if (!box) return;
  if (form) form.style.display = "none";

  box.style.display = "block";
  box.innerHTML = "<h3>Your Items</h3>";

  let myItems = items.filter(i => i.owner === currentUser);

  if (myItems.length === 0) {
    box.innerHTML += "<p>No items added yet.</p>";
    return;
  }

  myItems.forEach((i, index) => {

    // ⭐ Calculate rating
    let itemReviews = reviews.filter(r =>
      r.itemName === i.name && r.owner === i.owner
    );

    let ratingHTML = "⭐ No reviews";

    if (itemReviews.length > 0) {
      let total = 0;
      itemReviews.forEach(r => total += Number(r.rating));
      let avg = (total / itemReviews.length).toFixed(1);
      ratingHTML = `⭐ ${avg} (${itemReviews.length} reviews)`;
    }

    box.innerHTML += `
<div class="item-card">

  <img src="${i.image}" alt="item">

  <div class="item-details">
    <b>${i.name}</b><br>
    <p style="font-weight:bold; margin:5px 0;">
  <span style="color:gold;">⭐</span>
  <span style="color:#333;">
    ${ratingHTML.replace("⭐ ", "")}
  </span>
</p><br><br>
    Rent: ₹${i.price}<br>
    Deposit: ₹${i.deposit}<br>
    Brand: ${i.brand}<br>
    Features: ${i.features}<br>
    Quantity: ${i.quantity}<br><br>

    <button onclick="editItem(${index})">Edit</button>

    <button onclick="deleteItem(${index})">Remove</button>

    <button onclick="showOwnerItemReviews('${i.name}', '${i.owner}')">
      Reviews
    </button>
  </div>

</div>
`;
  });
}

function deleteItem(index) {
  let items = JSON.parse(localStorage.getItem("items")) || [];
  let currentUser = localStorage.getItem("currentUser");
  let myItems = items.filter(i => i.owner === currentUser);
  let itemToRemove = myItems[index];
  items = items.filter(i => i !== itemToRemove);
  localStorage.setItem("items", JSON.stringify(items));
  showMyItems();
}

function editItem(index) {

  let items = JSON.parse(localStorage.getItem("items")) || [];
  let currentUser = localStorage.getItem("currentUser");

  let myItems = items.filter(i => i.owner === currentUser);
  let item = myItems[index];

  if (!item) {
    alert("Item not found");
    return;
  }

  // Store original index
  editItemIndex = items.indexOf(item);

  // Fill form
  document.getElementById("edit_name").value = item.name;
  document.getElementById("edit_price").value = item.price;
  document.getElementById("edit_deposit").value = item.deposit;
  document.getElementById("edit_brand").value = item.brand;
  document.getElementById("edit_features").value = item.features;
  document.getElementById("edit_quantity").value = item.quantity;

  // Show edit form
  document.getElementById("editForm").style.display = "block";

  // Hide others
  document.getElementById("addForm").style.display = "none";
  document.getElementById("myItems").style.display = "none";
}



// ===== Customer Functions =====
function showItemsForRent() {
  let items = JSON.parse(localStorage.getItem("items")) || [];
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  let box = document.getElementById("items");
  if (!box) return;

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};

  box.innerHTML = "<h3>Available Items</h3>";

  items.forEach((i, index) => {

    let availableQuantity = i.quantity !== undefined ? i.quantity : 1;
    let ownerName = profiles[i.owner]?.name || i.owner;

    // ⭐ Calculate rating
    let itemReviews = reviews.filter(r =>
      r.itemName === i.name && r.owner === i.owner
    );

    let ratingHTML = "⭐ No reviews";

    if (itemReviews.length > 0) {
      let total = 0;
      itemReviews.forEach(r => total += Number(r.rating));
      let avg = (total / itemReviews.length).toFixed(1);
      ratingHTML = `⭐ ${avg} (${itemReviews.length} reviews)`;
    }

    box.innerHTML += `
<div class="item-card">

  <img src="${i.image}" alt="item">

  <div class="item-details">
    <h3>${i.name}</h3>
    <p style="font-weight:bold; margin:5px 0;">
  <span style="color:gold;">⭐</span>
  <span style="color:#333;">
    ${ratingHTML.replace("⭐ ", "")}
  </span>
</p>
    <p>Rent: ₹${i.price}</p>
    <p>Deposit: ₹${i.deposit || 0}</p>
    <p>Owner: ${ownerName}</p>
    <p>Available: ${availableQuantity} left</p>

    <button ${availableQuantity === 0 ? "disabled" : ""} 
      onclick="openRentCalendar(${index})">
      Rent
    </button>

    <button onclick="showItemReviews('${i.name}', '${i.owner}')">
      View Reviews
    </button>
  </div>

</div>
`;
  });
}



// ===== Notifications =====
function openOwnerNotifications() {

  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let currentUser = localStorage.getItem("currentUser");

  let box = document.getElementById("myItems");
  let form = document.getElementById("addForm");

  if (!box) return;

  box.style.display = "block";
  if (form) form.style.display = "none";

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  box.innerHTML = "<h3>Notifications</h3>";

  let myNotifications = notifications.filter(n => n.owner === currentUser);

  if (myNotifications.length === 0) {
    box.innerHTML += "<p>No notifications.</p>";
  }

  myNotifications.slice().reverse().forEach(n => {

    let customerName = profiles[n.customer]?.name || n.customer;

    box.innerHTML += `
      <div>
        <b>${customerName}</b> wants to rent <b>${n.itemName}</b><br>
        From: ${n.fromDate}<br>
        To: ${n.toDate}<br>
        Days: ${n.days}<br>
       Rent per day: ₹${Number(n.pricePerDay) || 0}<br>
      <b>Total Rent: ₹${Number(n.totalRent) || 0}</b>


        Status: <b>${n.status}</b><br><br>

        ${n.status === "Pending" ? `
          <button onclick="acceptRequest(${n.id})">Accept</button>
          <button onclick="rejectRequest(${n.id})">Reject</button>
        ` : `<p>Request ${n.status}</p>`}
      </div>
    `;
  });

  // mark owner notifications as read
  let unread = JSON.parse(localStorage.getItem("ownerUnreadNotifications")) || {};
  unread[currentUser] = 0;
  localStorage.setItem("ownerUnreadNotifications", JSON.stringify(unread));

  updateOwnerNotificationBadge();
}




function acceptRequest(notificationId) {
  updateRequestStatusById(notificationId, "Accepted");
}

function rejectRequest(notificationId) {
  updateRequestStatusById(notificationId, "Rejected");
}





// ===== Customer Requests =====
function showMyRequests() {

  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let currentUser = localStorage.getItem("currentUser");
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let box = document.getElementById("items");

  box.innerHTML = "<h3>My Rental Requests</h3>";

  let myRequests = notifications.filter(n => n.customer === currentUser);

  if (myRequests.length === 0) {
    box.innerHTML += "<p>No rental requests yet.</p>";
    return;
  }

  myRequests.slice().reverse().forEach((n, index) => {

    let ownerName = profiles[n.owner]?.name || n.owner;

    box.innerHTML += `
      <div>
        <b>${n.itemName}</b><br>
        Total Rent: ₹${n.totalRent}<br>
        Security Deposit: ₹${n.deposit}<br>
        Owner: ${ownerName}<br>
        Status: <b>${n.status}</b><br>
        ${n.status === "Pending"
          ? `<button onclick="cancelRequest(${index})">Cancel</button>`
          : ""}
      </div>
    `;
  });
}


function cancelRequest(index) {
  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let currentUser = localStorage.getItem("currentUser");
  let myRequests = notifications.filter(n => n.customer === currentUser);
  let target = myRequests[index];
  if (target.status !== "Pending") { alert("Cannot cancel, already processed!"); return; }

  notifications = notifications.filter(n => !(n.customer === target.customer && n.itemName === target.itemName && n.status === "Pending"));
  localStorage.setItem("notifications", JSON.stringify(notifications));
  showMyRequests();
  alert("Request cancelled!");
}

// ===== Rental History =====
function showOwnerHistory() {

  let history = JSON.parse(localStorage.getItem("rentalHistory")) || [];
  let items = JSON.parse(localStorage.getItem("items")) || [];   // ⭐ get items to fetch image
  let currentUser = localStorage.getItem("currentUser");
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};

  let box = document.getElementById("myItems");
  let form = document.getElementById("addForm");
  if (!box) return;
  if (form) form.style.display = "none";

  box.style.display = "block";
  box.innerHTML = "<h3>Rental History</h3>";

  let myHistory = history.filter(h => h.owner === currentUser);

  if (myHistory.length === 0) {
    box.innerHTML += "<p>No rental history yet.</p>";
    return;
  }

  myHistory
    .slice()
    .reverse()
    .forEach(h => {

      // ✅ customer name
      let customerName = profiles[h.customer]?.name || h.customer;

      // ✅ find item to get image
      let itemData = items.find(
        i => i.name === h.itemName && i.owner === h.owner
      );

      let imageSrc = itemData?.image || "";

      box.innerHTML += `
        <div class="item-card">

          <img src="${imageSrc}" alt="item">

          <div class="item-details">
            Item: <b>${h.itemName}</b><br>
            Customer: <b>${customerName}</b><br>
            Status: <b>${h.status}</b>
          </div>

        </div>
      `;
    });
}



function showCustomerHistory() {

  checkLateReturns();

  let history = JSON.parse(localStorage.getItem("rentalHistory")) || [];
  let items = JSON.parse(localStorage.getItem("items")) || [];   // ⭐ load once
  let currentUser = localStorage.getItem("currentUser");
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let box = document.getElementById("items");

  box.innerHTML = "<h3>Rental History</h3>";

  let myHistory = [];

  history.forEach((h, index) => {
    if (h.customer === currentUser) {
      myHistory.push({ ...h, originalIndex: index });
    }
  });

  if (myHistory.length === 0) {
    box.innerHTML += "<p>No rental history yet.</p>";
    return;
  }

  myHistory.reverse().forEach(h => {

    let ownerName = profiles[h.owner]?.name || h.owner;

    let itemData = items.find(
      i => i.name === h.itemName && i.owner === h.owner
    );

    box.innerHTML += `
    <div class="item-card">

      <img src="${itemData?.image || ''}" alt="item">

      <div class="item-details">
        Item: <b>${h.itemName}</b><br>
        Owner: ${ownerName}<br>
        From: ${h.fromDate}<br>
        To: ${h.toDate}<br>
        Days: ${h.days}<br>
        Total Rent: ₹${h.totalRent}<br>
        Status: <b>${h.status}</b><br>

        ${
          h.status === "Accepted"
          ? `<button onclick="returnItem(${h.originalIndex})">Return</button>`
          : ""
        }

        ${
          h.status === "Returned"
          ? getReviewButton(h)
          : ""
        }

        ${
          h.penaltyAmount
          ? `<p style="color:red;">Penalty: ₹${h.penaltyAmount}</p>`
          : ""
        }
      </div>

    </div>
    `;
  });
}




// ===== Profile =====
function showProfile() {
  let currentUser = localStorage.getItem("currentUser");
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let user = profiles[currentUser];

  let box = document.getElementById("profile");
  if (!box || !user) return;

  box.innerHTML = `
    <p><b>Name:</b> ${user.name}</p>
    <p><b>Address:</b> ${user.address}</p>
    <p><b>Phone:</b> ${user.phone}</p>
  `;
}



function goDashboard() {
  let role = localStorage.getItem("role");
  if (role === "customer") window.location.href = "customer.html";
  else window.location.href = "owner.html";
}

if (document.getElementById("profile")) showProfile();


function openCustomerNotifications() {

  let notes = JSON.parse(localStorage.getItem("customerNotifications")) || [];
  let currentUser = localStorage.getItem("currentUser");
  let box = document.getElementById("items");

  if (!box) return;

  box.innerHTML = "<h3>Notifications</h3>";

  let myNotes = notes.filter(n => n.customer === currentUser);

  if (myNotes.length === 0) {
    box.innerHTML += "<p>No notifications.</p>";
  }

  // ✅ LATEST ON TOP
  myNotes.slice().reverse().forEach(n => {

    box.innerHTML += `
      <div style="border:1px solid #ccc; padding:5px; margin:5px 0;">
        ${n.message}
      </div>
    `;
  });

  let unread = JSON.parse(localStorage.getItem("unreadNotifications")) || {};
  unread[currentUser] = 0;
  localStorage.setItem("unreadNotifications", JSON.stringify(unread));

  updateNotificationBadge();
}




function openProfile() {

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let currentUser = localStorage.getItem("currentUser");

  // Detect which page container exists
  let box =
    document.getElementById("items") ||
    document.getElementById("myItems");

  if (!box) return;

  let user = profiles[currentUser];

  if (!user) {
    box.innerHTML = "<p>Profile not found.</p>";
    return;
  }

  box.innerHTML = `
    <h3>My Profile</h3>

    <p><b>Name:</b> ${user.name}</p>
    <p><b>Address:</b> ${user.address}</p>
    <p><b>Phone:</b> ${user.phone}</p>

    <br>
    <button onclick="editProfileInDashboard()">Edit Profile</button>
  `;
}

function editProfileInDashboard() {

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let currentUser = localStorage.getItem("currentUser");
  let box =
  document.getElementById("items") ||
  document.getElementById("myItems");
  let user = profiles[currentUser];

  box.innerHTML = `
    <h3>Edit Profile</h3>

    <input id="editName" type="text" value="${user.name}" placeholder="Name"><br><br>
    <input id="editPhone" 
       type="text" 
       value="${user.phone || ''}" 
       maxlength="10"
       placeholder="Enter 10-digit mobile number"
       oninput="this.value=this.value.replace(/[^0-9]/g,'')"><br><br>
    <input id="editAddress" type="text" value="${user.address}" placeholder="Address"><br><br>

    <button onclick="saveProfileFromDashboard()">Save</button>
    <button onclick="openProfile()">Cancel</button>
  `;
}


function saveProfileFromDashboard() {

  let name = document.getElementById("editName").value.trim();
  let phone = document.getElementById("editPhone").value.trim();
  let address = document.getElementById("editAddress").value.trim();

  if (!name || !phone || !address) {
    alert("All fields are required");
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Phone must be 10 digits");
    return;
  }

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let currentUser = localStorage.getItem("currentUser");

  profiles[currentUser] = {
    name,
    phone,
    address,
    completed: true
  };

  localStorage.setItem("profiles", JSON.stringify(profiles));

  alert("Profile updated successfully!");

  openProfile();
}


if (document.getElementById("vname")) loadViewProfile();



// Cancel edit
function cancelEditProfile() {
  let role = localStorage.getItem("role");
  if (role === "customer") window.location.href = "customer.html";
  else window.location.href = "owner.html";
}


document.addEventListener("DOMContentLoaded", function () {

  // ===== Customer Dashboard =====
  if (document.getElementById("notifBadge")) {
    updateNotificationBadge();
  }

  // ===== Owner Dashboard =====
  if (document.getElementById("ownerNotifBadge")) {
    updateOwnerNotificationBadge();
  }

});





function updateNotificationBadge() {

  let unread = JSON.parse(localStorage.getItem("unreadNotifications")) || {};
  let currentUser = localStorage.getItem("currentUser");

  let badge = document.getElementById("notifBadge");
  if (!badge) return;

  let count = unread[currentUser] || 0;

  if (count > 0) {
    badge.innerText = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

function updateOwnerNotificationBadge() {

  let unread = JSON.parse(localStorage.getItem("ownerUnreadNotifications")) || {};
  let currentUser = localStorage.getItem("currentUser");

  let badge = document.getElementById("ownerNotifBadge");
  if (!badge) return;

  let count = unread[currentUser] || 0;

  if (count > 0) {
    badge.innerText = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}


function updateRequestStatusById(notificationId, newStatus) {

  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let customerNotifications = JSON.parse(localStorage.getItem("customerNotifications")) || [];
  let rentalHistory = JSON.parse(localStorage.getItem("rentalHistory")) || [];

  let target = notifications.find(n => n.id === notificationId);
  if (!target) return;

  target.status = newStatus;

  // reduce quantity
  if (newStatus === "Accepted") {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    let bookedItem = items.find(
      i => i.owner === target.owner && i.name === target.itemName
    );

    if (bookedItem) {
      bookedItem.quantity = (bookedItem.quantity || 1) - 1;
      if (bookedItem.quantity < 0) bookedItem.quantity = 0;
      localStorage.setItem("items", JSON.stringify(items));
    }
  }

  // notify customer
  customerNotifications.push({
    customer: target.customer,
    message: `Your request for "${target.itemName}" has been ${newStatus}`,
    read: false
  });

  // 🔴 unread bubble for customer
  let unread = JSON.parse(localStorage.getItem("unreadNotifications")) || {};
  unread[target.customer] = (unread[target.customer] || 0) + 1;
  localStorage.setItem("unreadNotifications", JSON.stringify(unread));

  // rental history
  rentalHistory.push({
    customer: target.customer,
    owner: target.owner,
    itemName: target.itemName,
    fromDate: target.fromDate,
    toDate: target.toDate,
    days: target.days,
    totalRent: target.totalRent,
    deposit: target.deposit,
    status: newStatus
  });


  localStorage.setItem("notifications", JSON.stringify(notifications));
  localStorage.setItem("customerNotifications", JSON.stringify(customerNotifications));
  localStorage.setItem("rentalHistory", JSON.stringify(rentalHistory));

  openOwnerNotifications(); // instant UI refresh
}

function openRentCalendar(index) {
  selectedRentIndex = index;

  document.getElementById("rentFrom").value = "";
  document.getElementById("rentTo").value = "";
  document.getElementById("rentDays").innerText = "";
  document.getElementById("rentAmount").innerText = "";

  document.getElementById("rentModal").style.display = "flex";
}


document.addEventListener("DOMContentLoaded", function () {

  let from = document.getElementById("rentFrom");
  let to = document.getElementById("rentTo");

  if (from && to) {

    // ===== TODAY DATE =====
    let today = new Date();
    let todayStr = today.toISOString().split("T")[0];

    // ===== 1 MONTH LIMIT =====
    let maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    let maxStr = maxDate.toISOString().split("T")[0];

    // Apply restrictions to START DATE
    from.min = todayStr;
    from.max = maxStr;

    // When start date changes
    from.addEventListener("change", function () {

      // Return date cannot be before start date
      to.min = from.value;

      calculateRent();
    });

    // Return date change
    to.addEventListener("change", calculateRent);
  }

});

let editItemIndex = null;

function calculateRent() {

  if (selectedRentIndex === null) return;

  let from = document.getElementById("rentFrom").value;
  let to = document.getElementById("rentTo").value;

  if (!from || !to) return;

  let start = new Date(from);
  let end = new Date(to);

  if (end < start) {
    alert("To date cannot be before From date");
    document.getElementById("rentTo").value = "";
    return;
  }

  let oneDay = 24 * 60 * 60 * 1000;
  let days = Math.round((end - start) / oneDay) + 1;

  let items = JSON.parse(localStorage.getItem("items")) || [];
  let item = items[selectedRentIndex];

  if (!item || !item.price) return;

  let pricePerDay = Number(item.price) || 0;
  let total = days * pricePerDay;

  document.getElementById("rentDays").innerText =
    `Total Days: ${days}`;

  document.getElementById("rentAmount").innerText =
    `Total Rent: ₹${total}`;
}



function confirmRent() {

  let fromDate = document.getElementById("rentFrom").value;
  let toDate = document.getElementById("rentTo").value;

  if (!fromDate || !toDate) {
    alert("Please select both dates");
    return;
  }

  let items = JSON.parse(localStorage.getItem("items")) || [];
  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  let item = items[selectedRentIndex];
  let customer = localStorage.getItem("currentUser");

  let start = new Date(fromDate);
  let end = new Date(toDate);
  let days = Math.round((end - start) / (24*60*60*1000)) + 1;
  let pricePerDay = Number(item.price) || 0;
  let totalRent = pricePerDay * days;


  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let customerName = profiles[customer]?.name || customer;

  notifications.push({
    id: Date.now(),
    owner: item.owner,
    customer,
    customerName,
    itemName: item.name,
    pricePerDay: Number(item.price), // ✅ number
    fromDate,
    toDate,
    days,
    totalRent,                       // ✅ number
    deposit: item.deposit,
    status: "Pending"
  });


  localStorage.setItem("notifications", JSON.stringify(notifications));

  // owner unread bubble
  let ownerUnread = JSON.parse(localStorage.getItem("ownerUnreadNotifications")) || {};
  ownerUnread[item.owner] = (ownerUnread[item.owner] || 0) + 1;
  localStorage.setItem("ownerUnreadNotifications", JSON.stringify(ownerUnread));

  alert("Rent request sent!");
  closeRentModal();
}

function closeRentModal() {
  document.getElementById("rentModal").style.display = "none";
  selectedRentIndex = null;
}

function editMyProfile() {

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let user = localStorage.getItem("currentUser");

  if (!profiles[user]) return;

  // Name
  document.getElementById("pname").value =
    (profiles[user].name || "").trim();

  // Phone (FIXED – trims spaces so placeholder works)
  document.getElementById("pphone").value =
    (profiles[user].phone || "").trim();

  // Address
  document.getElementById("paddress").value =
    (profiles[user].address || "").trim();

  // Switch to edit mode
  document.getElementById("viewProfile").style.display = "none";
  document.getElementById("editProfile").style.display = "block";
}

function loadWelcomeName() {
  let user = localStorage.getItem("currentUser");
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};

  let displayName = profiles[user]?.name || user;

  let el = document.getElementById("currentUser");
  if (el) el.innerText = displayName;
}

function handleLoginEnter(event) {

  if (event.key === "Enter") {

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    // Mandatory validation
    if (!user || !pass) {
      document.getElementById("msg").innerText =
        "Please enter username and password!";
      return;
    }

    // Trigger login
    login();
  }
}

function saveEditedItem() {

  let items = JSON.parse(localStorage.getItem("items")) || [];

  items[editItemIndex].name =
    document.getElementById("edit_name").value.trim();

  items[editItemIndex].price =
    Number(document.getElementById("edit_price").value);

  items[editItemIndex].deposit =
    document.getElementById("edit_deposit").value.trim();

  items[editItemIndex].brand =
    document.getElementById("edit_brand").value.trim();

  items[editItemIndex].features =
    document.getElementById("edit_features").value.trim();

  items[editItemIndex].quantity =
    parseInt(document.getElementById("edit_quantity").value) || 1;

  let newImage = document.getElementById("edit_image").files[0];

  if (newImage) {
    let reader = new FileReader();
    reader.onload = function(e) {
      items[editItemIndex].image = e.target.result;
      localStorage.setItem("items", JSON.stringify(items));
      finishEdit();
    };
    reader.readAsDataURL(newImage);
  } else {
    localStorage.setItem("items", JSON.stringify(items));
    finishEdit();
  }
}

function finishEdit(){
  alert("Item updated!");
  document.getElementById("editForm").style.display = "none";
  showMyItems();
}



function cancelEditItem() {
  document.getElementById("editForm").style.display = "none";
  showMyItems();
}

function returnItem(index) {

  let history = JSON.parse(localStorage.getItem("rentalHistory")) || [];
  let items = JSON.parse(localStorage.getItem("items")) || [];

  let record = history[index];
  if (!record) return;

  record.status = "Returned";

  // Increase quantity back
  let item = items.find(
    i => i.owner === record.owner && i.name === record.itemName
  );

  if (item) {
    item.quantity = (item.quantity || 0) + 1;
  }

  localStorage.setItem("items", JSON.stringify(items));
  localStorage.setItem("rentalHistory", JSON.stringify(history));

  alert("Item returned successfully!");

  showCustomerHistory();
}


function checkLateReturns() {

  let history = JSON.parse(localStorage.getItem("rentalHistory")) || [];
  let notes = JSON.parse(localStorage.getItem("customerNotifications")) || [];

  let today = new Date();
  today.setHours(0,0,0,0);   // ⭐ remove time

  history.forEach(h => {

    if (h.status !== "Accepted") return;

    let endDate = new Date(h.toDate);
    endDate.setHours(0,0,0,0);   // ⭐ remove time

    // ⭐ penalty only if AFTER due date
    if (today > endDate) {

      let lateDays =
        Math.floor((today - endDate) / (1000 * 60 * 60 * 24));

      let penalty =
        200 + (lateDays * (h.totalRent / h.days));

      if (!h.penaltyApplied) {

        notes.push({
          customer: h.customer,
          message:
            `Late return for "${h.itemName}". ` +
            `Penalty: ₹${penalty}`,
          read: false
        });

        h.penaltyApplied = true;
        h.penaltyAmount = penalty;
      }
    }
  });

  localStorage.setItem("rentalHistory", JSON.stringify(history));
  localStorage.setItem("customerNotifications", JSON.stringify(notes));
}


function getReviewButton(historyItem) {

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  let currentUser = localStorage.getItem("currentUser");

  let existing = reviews.find(r =>
    r.customer === currentUser &&
    r.itemName === historyItem.itemName &&
    r.owner === historyItem.owner
  );

  if (existing) {
    return `
      <button onclick="openReviewForm('${historyItem.itemName}', '${historyItem.owner}', true)">
        Edit Review
      </button>

      <button onclick="deleteReview('${historyItem.itemName}', '${historyItem.owner}')"
        style="background:#ff4d4d; border-color:#ff4d4d; color:white;">
        Delete Review
      </button>
    `;
  } else {
    return `
      <button onclick="openReviewForm('${historyItem.itemName}', '${historyItem.owner}', false)">
        Give Review
      </button>
    `;
  }
}

let reviewItemName = null;
let reviewOwner = null;
let editMode = false;

function openReviewForm(itemName, owner, isEdit = false) {

  reviewItemName = itemName;   // ✅ FIX
  reviewOwner = owner;         // ✅ FIX

  let currentUser = localStorage.getItem("currentUser");
  let modal = document.getElementById("reviewModal");

  if (isEdit) {
    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    let existing = reviews.find(r =>
      r.itemName === itemName &&
      r.owner === owner &&
      r.customer === currentUser
    );

    if (existing) {
      document.getElementById("reviewRating").value = existing.rating;
      document.getElementById("reviewComment").value = existing.comment;
    }
  } else {
    document.getElementById("reviewRating").value = "";
    document.getElementById("reviewComment").value = "";
  }

  modal.style.display = "flex";
}

function saveReview() {

  let rating = Number(document.getElementById("reviewRating").value);
  let comment = document.getElementById("reviewComment").value.trim();
  let currentUser = localStorage.getItem("currentUser");

  if (!rating || rating < 1 || rating > 5) {
    alert("Rating must be between 1 and 5");
    return;
  }

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  let existingIndex = reviews.findIndex(r =>
    r.customer === currentUser &&
    r.itemName === reviewItemName &&
    r.owner === reviewOwner
  );

  if (existingIndex !== -1) {
    // EDIT
    reviews[existingIndex].rating = rating;
    reviews[existingIndex].comment = comment;
  } else {
    // NEW
    reviews.push({
      itemName: reviewItemName,
      owner: reviewOwner,
      customer: currentUser,
      rating: rating,
      comment: comment,
      date: new Date().toLocaleDateString()
    });
  }

  localStorage.setItem("reviews", JSON.stringify(reviews));

  alert("Review saved successfully!");
  closeReviewModal();
  showCustomerHistory();
}

function closeReviewModal() {
  document.getElementById("reviewModal").style.display = "none";
}

function showItemReviews(itemName, owner) {

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let box = document.getElementById("items");

  box.innerHTML = `<h3>Reviews for ${itemName}</h3>`;

  let itemReviews = reviews.filter(r =>
    r.itemName === itemName && r.owner === owner
  );

  if (itemReviews.length === 0) {
    box.innerHTML += "<p>No reviews yet.</p>";
  } else {
    itemReviews.forEach(r => {

      let customerName = profiles[r.customer]?.name || r.customer;

      box.innerHTML += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <b>${customerName}</b><br>
          Rating: ${r.rating}/5<br>
          Comment: ${r.comment}<br>
          Date: ${r.date}
        </div>
      `;
    });
  }

  box.innerHTML += `<br><button onclick="showItemsForRent()">Back</button>`;
}

document.addEventListener("DOMContentLoaded", function () {

  // Hide review modal on page load
  let reviewModal = document.getElementById("reviewModal");
  if (reviewModal) {
    reviewModal.style.display = "none";
  }

  // Hide rent modal on page load
  let rentModal = document.getElementById("rentModal");
  if (rentModal) {
    rentModal.style.display = "none";
  }

});

function deleteReview(itemName, owner) {

  let confirmDelete = confirm("Are you sure you want to delete this review?");
  if (!confirmDelete) return;

  let currentUser = localStorage.getItem("currentUser");
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  reviews = reviews.filter(r =>
    !(r.customer === currentUser &&
      r.itemName === itemName &&
      r.owner === owner)
  );

  localStorage.setItem("reviews", JSON.stringify(reviews));

  alert("Review deleted successfully!");
  showCustomerHistory();
}

function showOwnerItemReviews(itemName, owner) {

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let box = document.getElementById("myItems");

  box.innerHTML = `<h3>Reviews for ${itemName}</h3>`;

  let itemReviews = reviews.filter(r =>
    r.itemName === itemName && r.owner === owner
  );

  if (itemReviews.length === 0) {
    box.innerHTML += "<p>No reviews yet.</p>";
  } else {

    let total = 0;

    itemReviews.forEach(r => {

      total += Number(r.rating);

      let customerName = profiles[r.customer]?.name || r.customer;

      box.innerHTML += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <b>${customerName}</b><br>
          Rating: ${r.rating}/5<br>
          Comment: ${r.comment}<br>
          Date: ${r.date}
        </div>
      `;
    });

    let avg = (total / itemReviews.length).toFixed(1);

    box.innerHTML = `
      <h3>Reviews for ${itemName}</h3>
      <p><b>Average Rating:</b> ${avg} ⭐ 
      (${itemReviews.length} reviews)</p>
    ` + box.innerHTML.split("</h3>")[1];
  }

  box.innerHTML += `
    <br>
    <button onclick="showMyItems()">Back</button>
  `;
}

function getItemRating(itemName, owner) {

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  let itemReviews = reviews.filter(r =>
    r.itemName === itemName && r.owner === owner
  );

  if (itemReviews.length === 0) {
    return "⭐ No reviews";
  }

  let total = 0;

  itemReviews.forEach(r => {
    total += Number(r.rating);
  });

  let avg = (total / itemReviews.length).toFixed(1);

  return `⭐ ${avg} (${itemReviews.length} reviews)`;
}

function saveEditedProfile() {

  let name = document.getElementById("pname").value.trim();
  let phone = document.getElementById("pphone").value.trim();
  let address = document.getElementById("paddress").value.trim();

  if (!name || !phone || !address) {
    document.getElementById("pmsg").innerText = "All fields are required!";
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    document.getElementById("pmsg").innerText = "Phone must be 10 digits!";
    return;
  }

  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let currentUser = localStorage.getItem("currentUser");

  profiles[currentUser] = {
    name,
    phone,
    address,
    completed: true
  };

  localStorage.setItem("profiles", JSON.stringify(profiles));

  document.getElementById("pmsg").innerText = "Profile saved successfully!";

  setTimeout(() => {
    goDashboard();   // redirect to customer/owner dashboard
  }, 1000);
}

function loadViewProfile() {

  let currentUser = localStorage.getItem("currentUser");
  let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  let user = profiles[currentUser];

  if (!user) return;

  // ⭐ IF PROFILE NOT COMPLETED → FORCE EDIT MODE
  if (!user.completed) {

    document.getElementById("viewProfile").style.display = "none";
    document.getElementById("editProfile").style.display = "block";

    return;
  }

  // Otherwise show profile normally
  document.getElementById("vname").innerText = user.name;
  document.getElementById("vphone").innerText = user.phone;
  document.getElementById("vaddress").innerText = user.address;

  document.getElementById("viewProfile").style.display = "block";
  document.getElementById("editProfile").style.display = "none";
}