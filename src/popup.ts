const popup = document.getElementById('popup');

if (popup) {
    popup.innerHTML = '<h1>Hello Pika!</h1><p>Welcome to your Chrome Extension!</p>';
}

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', () => {
            alert('Button clicked!');
        });
    }
});