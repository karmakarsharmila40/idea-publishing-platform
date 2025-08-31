// Ideas-related functions

// Get all ideas with filtering and pagination
async function getIdeas(page = 1, filters = {}) {
  try {
    let queryParams = `page=${page}`;
    
    // Add filters to query params
    if (filters.category) {
      queryParams += `&category=${filters.category}`;
    }
    
    if (filters.search) {
      queryParams += `&search=${encodeURIComponent(filters.search)}`;
    }
    
    if (filters.sortBy) {
      queryParams += `&sortBy=${filters.sortBy}&order=${filters.order || 'desc'}`;
    }
    
    return await apiRequest(`/ideas?${queryParams}`);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    throw error;
  }
}

// Get a single idea by ID
async function getIdeaById(id) {
  try {
    return await apiRequest(`/ideas/${id}`);
  } catch (error) {
    console.error(`Error fetching idea ${id}:`, error);
    throw error;
  }
}

// Create a new idea
async function createIdea(ideaData) {
  try {
    return await apiRequest('/ideas', {
      method: 'POST',
      body: JSON.stringify(ideaData)
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    throw error;
  }
}

// Update an idea
async function updateIdea(id, ideaData) {
  try {
    return await apiRequest(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ideaData)
    });
  } catch (error) {
    console.error(`Error updating idea ${id}:`, error);
    throw error;
  }
}

// Delete an idea
async function deleteIdea(id) {
  try {
    return await apiRequest(`/ideas/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error(`Error deleting idea ${id}:`, error);
    throw error;
  }
}

// Vote on an idea
async function voteIdea(id, voteType) {
  try {
    return await apiRequest(`/ideas/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType })
    });
  } catch (error) {
    console.error(`Error voting on idea ${id}:`, error);
    throw error;
  }
}

// Add a comment to an idea
async function addComment(ideaId, text) {
  try {
    return await apiRequest(`/comments/${ideaId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  } catch (error) {
    console.error(`Error adding comment to idea ${ideaId}:`, error);
    throw error;
  }
}

// Delete a comment
async function deleteComment(ideaId, commentId) {
  try {
    return await apiRequest(`/comments/${ideaId}/${commentId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
}

// Upload a file attachment to an idea
async function uploadFile(ideaId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiRequest(`/files/${ideaId}`, {
      method: 'POST',
      headers: {}, // Let the browser set the content type for FormData
      body: formData
    });
  } catch (error) {
    console.error(`Error uploading file to idea ${ideaId}:`, error);
    throw error;
  }
}

// Delete a file attachment
async function deleteFile(ideaId, fileId) {
  try {
    return await apiRequest(`/files/${ideaId}/${fileId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    throw error;
  }
}

// Render ideas list with pagination
function renderIdeasList(ideasData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const { ideas, totalPages, currentPage } = ideasData;
  
  // Clear container
  container.innerHTML = '';
  
  if (ideas.length === 0) {
    container.innerHTML = '<p class="no-ideas">No ideas found. Be the first to share your idea!</p>';
    return;
  }
  
  // Create ideas list
  const ideasList = document.createElement('div');
  ideasList.className = 'ideas-grid';
  
  ideas.forEach(idea => {
    const ideaCard = document.createElement('div');
    ideaCard.className = 'idea-card';
    ideaCard.innerHTML = `
      <div class="idea-header">
        <h3 class="idea-title">${idea.title}</h3>
        <span class="idea-category">${idea.category}</span>
      </div>
      <p class="idea-description">${idea.description.substring(0, 150)}${idea.description.length > 150 ? '...' : ''}</p>
      <div class="idea-meta">
        <span>By ${idea.user ? idea.user.username : 'Anonymous'}</span>
        <span>${idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : ''}</span>
      </div>
      <div class="idea-stats">
        <span><i class="fas fa-eye"></i> ${idea.views}</span>
        <span><i class="fas fa-comment"></i> ${idea.comments ? idea.comments.length : 0}</span>
        <div class="vote-controls">
          <button class="vote-btn upvote" data-id="${idea._id}" data-vote="up">
            <i class="fas fa-arrow-up"></i> ${idea.votes ? idea.votes.upvotes.length : 0}
          </button>
          <button class="vote-btn downvote" data-id="${idea._id}" data-vote="down">
            <i class="fas fa-arrow-down"></i> ${idea.votes ? idea.votes.downvotes.length : 0}
          </button>
        </div>
      </div>
      <a href="idea.html?id=${idea._id}" class="view-idea-btn">View Details</a>
    `;
    
    ideasList.appendChild(ideaCard);
  });
  
  container.appendChild(ideasList);
  
  // Add pagination
  if (totalPages > 1) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    // Previous button
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'pagination-btn';
      prevBtn.textContent = 'Previous';
      prevBtn.addEventListener('click', () => {
        loadIdeas(currentPage - 1);
      });
      pagination.appendChild(prevBtn);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        if (i !== currentPage) {
          loadIdeas(i);
        }
      });
      pagination.appendChild(pageBtn);
    }
    
    // Next button
    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'pagination-btn';
      nextBtn.textContent = 'Next';
      nextBtn.addEventListener('click', () => {
        loadIdeas(currentPage + 1);
      });
      pagination.appendChild(nextBtn);
    }
    
    container.appendChild(pagination);
  }
  
  // Add event listeners to vote buttons
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (!isAuthenticated()) {
        alert('Please login to vote on ideas');
        return;
      }
      
      const ideaId = btn.dataset.id;
      const voteType = btn.dataset.vote;
      
      try {
        const result = await voteIdea(ideaId, voteType);
        
        // Update vote counts
        const upvoteBtn = document.querySelector(`.upvote[data-id="${ideaId}"]`);
        const downvoteBtn = document.querySelector(`.downvote[data-id="${ideaId}"]`);
        
        if (upvoteBtn) {
          upvoteBtn.innerHTML = `<i class="fas fa-arrow-up"></i> ${result.upvotes}`;
        }
        
        if (downvoteBtn) {
          downvoteBtn.innerHTML = `<i class="fas fa-arrow-down"></i> ${result.downvotes}`;
        }
      } catch (error) {
        console.error('Error voting:', error);
        alert('Failed to vote. Please try again.');
      }
    });
  });
}