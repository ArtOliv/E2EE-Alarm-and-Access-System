import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('pt-BR')
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('pt-BR')
}