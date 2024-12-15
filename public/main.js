$(document).ready(function() {
    // Load photos when the page loads
    loadPhotos();

    // Handle photo upload
    $('#uploadForm').on('submit', function(e) {
        e.preventDefault();
        
        const fileInput = $('#photoInput')[0];
        const caption = $('#photoCaption').val();
        
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('photo', fileInput.files[0]);
            formData.append('caption', caption);

            $.ajax({
                url: '/api/photos',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    alert('Photo uploaded successfully!');
                    loadPhotos(); // Reload the photos
                    $('#uploadForm')[0].reset();
                },
                error: function(xhr, status, error) {
                    alert('Error uploading photo: ' + error);
                }
            });
        }
    });

    function loadPhotos() {
        $.ajax({
            url: '/api/photos',
            method: 'GET',
            success: function(photos) {
                const photoFeed = $('#photoFeed');
                photoFeed.empty();
                
                photos.forEach(photo => {
                    const photoCard = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card photo-card">
                                <div class="photo-container">
                                    <img src="${photo.url}" class="card-img-top" alt="${photo.caption}">
                                </div>
                                <div class="card-body">
                                    <p class="card-text">${photo.caption}</p>
                                    <small class="text-muted">${new Date(photo.timestamp).toLocaleString()}</small>
                                </div>
                            </div>
                        </div>
                    `;
                    photoFeed.append(photoCard);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error loading photos:', error);
            }
        });
    }
});
