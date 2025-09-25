# Classroom Detail Screen Enhancement TODO

## Database Operations (src/lib/supabase.ts)
- [x] Add `createClass` function to insert new classes with generated class_code
- [x] Add `addStudentToClass` function to add students to classes
- [x] Add `removeStudentFromClass` function to remove students from classes
- [x] Add `deleteClass` function to delete classes and related data

## UI and Logic Updates (src/pages/Classroom.tsx)
- [ ] Update `loadClasses` to map students with full user details (full_name, avatar_url)
- [ ] Update `handleCreateClass` to use DB and reload classes
- [ ] Update `handleAddStudent` to use DB and validate student ID
- [ ] Update `handleRemoveStudent` to use DB
- [ ] Update `handleDeleteClass` to use DB
- [ ] Improve class details modal UI: display student names/avatars, better layout, loading states

## Testing and Verification
- [ ] Test create class functionality
- [ ] Test add/remove students
- [ ] Test delete class
- [ ] Verify UI displays correctly with real data
