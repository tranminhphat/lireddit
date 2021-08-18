import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import * as React from "react";
import { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<
	HTMLInputElement | HTMLTextAreaElement
> & {
	name: string;
	label: string;
	placeholder: string;
	textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
	label,
	textarea,
	size: _,
	...props
}: InputFieldProps) => {
	const [field, { error }] = useField(props);
	const InputOrTextArea = textarea ? Textarea : Input;

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<InputOrTextArea
				{...field}
				{...props}
				id={field.name}
				placeholder={props.placeholder}
			/>
			<FormErrorMessage>{error}</FormErrorMessage>
		</FormControl>
	);
};

export default InputField;
