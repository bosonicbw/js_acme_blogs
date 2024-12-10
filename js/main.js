function createElemWithText(tagName = "p", textContent = "", className = "") {
    const element = document.createElement(tagName);
    element.textContent = textContent;
    element.className = className;
    return element;
}

function createSelectOptions(users) {
    if (!users) return undefined;
    const options = [];
    for (const user of users) {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        options.push(option);
    }
    return options;
}


function toggleCommentSection(postId) {
    if(!postId) return undefined;
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (!section) return null;
    section.classList.toggle("hide");
    return section;
}

function toggleCommentButton(postId) {
    if (!postId) return undefined;
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (!button) return null;
    button.textContent = button.textContent === "Show Comments" ? "Hide Comments" : "Show Comments";
    return button;
}

function deleteChildElements(parentElement) {
    if (!(parentElement instanceof HTMLElement)) return undefined;
    while (parentElement.lastElementChild) {
        parentElement.removeChild(parentElement.lastElementChild);
    }
    return parentElement;
}

function addButtonListeners() {
    const buttons = document.querySelectorAll("main button");
    buttons.forEach(button => {
        const postId = button.dataset.postId;
        if (postId) {
            button.addEventListener("click", (event) => toggleComments(event, postId));
        }
    });
    return buttons;
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll("main button");
    buttons.forEach(button => {
        const postId = button.dataset.postId;
        if (postId) {
            button.removeEventListener("click", (event) => toggleComments(event, postId));
        }
    });
    return buttons;
}

function createComments(comments) {
    if (!comments) return undefined;
    const fragment = document.createDocumentFragment();
    comments.forEach(comment => {
        const article = document.createElement("article");
        const name = createElemWithText("h3", comment.name);
        const body = createElemWithText("p", comment.body);
        const email = createElemWithText("p", `From: ${comment.email}`);
        article.append(name, body, email);
        fragment.appendChild(article);
    });
    return fragment;
}

function populateSelectMenu(users) {
    if (!users) return undefined;
    const selectMenu = document.getElementById("selectMenu");
    const options = createSelectOptions(users);
    options.forEach(option => selectMenu.appendChild(option));
    return selectMenu
}

async function getUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getUserPosts(userId) {
    if (!userId) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getUser(userId) {
    if (!userId) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getPostComments(postId) {
    if (!postId) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function displayComments(postId) {
    if (!postId) return undefined;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments", "hide");
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
}

async function createPosts(posts) {
    if (!posts) return undefined;
    const fragment = document.createDocumentFragment();
    for (const postData of posts) {
        const article = document.createElement("article");
        const title = createElemWithText("h2", postData.title);
        const body = createElemWithText("p", postData.body);
        const postId = createElemWithText("p", `Post ID: ${postData.id}`);
        const author = await getUser(postData.userId);
        const authorInfo = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);
        const catchPhrase = createElemWithText("p", author.company.catchPhrase);
        const button = createElemWithText("button", "Show Comments");
        button.dataset.postId = postData.id
        const section = await displayComments(postData.id);
        article.append(title, body, postId, authorInfo, catchPhrase, button, section);
        fragment.appendChild(article);
    }
    return fragment;
}

async function displayPosts(posts) {
    const main = document.querySelector("main");
    if (!posts) {
        const paragraph = createElemWithText("p", "Select an Employee to display their posts.", "default-text");
        main.appendChild(paragraph);
        return paragraph;
    }
    const element = await createPosts(posts);
    main.appendChild(element);
    return element;
}


function toggleComments(event, postId) {
    if (!event || !postId) return undefined;
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

async function refreshPosts(posts) {
    if (!posts) return undefined;
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector("main"));
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
    if (!event || !event.target) return undefined;
    event.target.disabled = true;
    const userId = event.target.value || 1;
    const posts = getUserPosts(userId);
    const refreshPostsArray = refreshPosts(posts);
    event.target.disabled = false;
    return [userId, posts, refreshPostsArray];
}

async function initPage() {
    const users = await getUsers();
    const selectMenu = populateSelectMenu(users);
    return [users, selectMenu];
}

function initApp() {
    initPage();
    document.getElementById("selectMenu").addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);
