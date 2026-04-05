import * as classesApi from "@/api/classes";

export const listClasses = classesApi.listClasses;
export const listMyClasses = classesApi.listMyClasses;
export const getClass = classesApi.getClass;
export const listMembers = classesApi.listMembers;
export const createClass = classesApi.createClass;
export const updateClass = classesApi.updateClass;
export const archiveClass = classesApi.archiveClass;
export const joinClass = classesApi.joinClass;
export const leaveClass = classesApi.leaveClass;
export const removeMember = classesApi.removeMember;
export const updateClassTeacher = classesApi.updateClassTeacher;
export const listClassTeachers = classesApi.listClassTeachers;
export const addClassTeachers = classesApi.addClassTeachers;
export const removeClassTeacher = classesApi.removeClassTeacher;

export type { ClassResponse, ClassDetail, ClassMemberResponse } from "@/api/classes";
