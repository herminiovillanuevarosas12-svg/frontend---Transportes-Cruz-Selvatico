/**
 * FAQAccordion - Item individual de FAQ accordion
 * Props: numero (int), pregunta (string), respuesta (string), isOpen (boolean), onToggle (function)
 */

import { ChevronDown } from 'lucide-react'

const FAQAccordion = ({ numero, pregunta, respuesta, isOpen, onToggle }) => {
  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        isOpen
          ? 'border-primary-500 bg-primary-50/30'
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      {/* Header clickable */}
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full p-4 cursor-pointer text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-gray-400 font-medium text-sm mt-0.5 flex-shrink-0">
            {numero}.
          </span>
          <span className={`text-sm md:text-base font-medium ${
            isOpen ? 'text-primary-700' : 'text-gray-700'
          }`}>
            {pregunta}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 ml-3 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-primary-600' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Body con animacion de altura */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0 pl-11">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {respuesta}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQAccordion
