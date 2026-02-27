# L1.2 Tasks

- [ ] Create `learn/forms.py` with `CommentForm(forms.ModelForm)` for `Comment.body`
- [ ] Update `learn/views.py:learn_detail` to handle POST:
      - Validate CommentForm
      - Set `comment.author = request.user.username`
      - Set `comment.post = post`
      - Save and redirect to same page (PRG pattern)
- [ ] Update `learn/templates/learn/detail.html`:
      - Show comments list with author and date
      - If authenticated: show CommentForm
      - If not authenticated: show "Log in to comment" link
- [ ] Test: post comment, verify it appears; try empty body, verify error
