import React from 'react'
import { useValue, observer } from 'startupjs'
import { Div, Span, TextInput, Select, Button } from '@startupjs/ui'

import './index.styl'

const QuestionList = ({ onAnswer, template }) => {
  const templateData = JSON.parse(template.template)
  const questions = templateData.questions
  const [answers, $answers] = useValue([])

  const initAnswers = () => {
    if (!answers.length) {
      return questions.map(q => (undefined))
    }
    return [...answers]
  }

  const onSetEnum = index => value => {
    const arr = initAnswers()
    arr[index] = value
    $answers.set([...arr])
  }
  const onSetText = index => value => {
    const arr = initAnswers()
    arr[index] = value
    $answers.set([...arr])
  }

  const renderQuestionByType = (index, type, value, values = []) => {
    let options = []
    if (values.length) {
      options = values.map(enumVal => ({ label: enumVal[0], value: enumVal[1] }))
    }
    const map = {
      enum: pug` Select(onChange=onSetEnum(index) value=value options=options)`,
      number: pug` TextInput(onChangeText=onSetText(index) value=value)`,
      text: pug` TextInput(onChangeText=onSetText(index) value=value)`
    }
    return map[type]
  }

  const onNext = () => {
    if (answers.filter(item => typeof item !== 'undefined').length === questions.length) {
      onAnswer(answers)
      $answers.set([])
    }
  }
  return pug`
    Div.root
      Div.questions
        each question, questionIndex in questions
          Div.question(key=questionIndex)
            Span.text #{question.title}
            Div #{renderQuestionByType(questionIndex, question.type, answers[questionIndex], question.values)}
      Button.button(onClick=onNext) #{'NEXT'}
  `
}
export default observer(QuestionList)
